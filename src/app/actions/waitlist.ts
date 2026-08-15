"use server";

import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { parseWaitlistInput } from "@/lib/waitlist-validation";
import { createRateLimiter } from "@/lib/rate-limit";
import { waitlistEmailCopy } from "@/content/waitlist-copy";
import { waitlistEmailHtml } from "@/lib/waitlist-email";

/**
 * Per-IP cap (docs/LAUNCH.md launch blocker, built 2026-07-27): 8 submissions
 * per 10 minutes -- far above any legit visitor (a duplicate email never
 * re-sends the confirmation, see the 23505 branch below, so abuse means many
 * DIFFERENT emails from one place, exactly what this throttles). Module-level
 * so the window survives across requests on a warm instance; per-instance
 * scope is the documented tradeoff in rate-limit.ts.
 */
const allowSubmission = createRateLimiter({ windowMs: 10 * 60_000, max: 8 });

/** Where new-signup alerts go. A real Workspace mailbox, not a send-only
 * address -- see docs/LAUNCH.md's mail DNS audit. */
const SIGNUP_NOTIFICATION_TO = "hello@kinectnow.com";

async function clientIp(): Promise<string> {
  const h = await headers();
  // First hop of x-forwarded-for is the client as seen by Vercel's edge.
  // Locally the header is absent; every dev request shares one bucket.
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Task 16 (waitlist): the one server-side entry point for a waitlist
 * submission. Never imported into a client component directly -- only
 * WaitlistDialog.tsx calls it, as a plain async function invocation (a
 * React Server Function can be called directly like this, not only via
 * `<form action>`; see node_modules/next/dist/docs/.../server-actions.md).
 */
export type WaitlistResult =
  | { ok: true; already?: boolean }
  | { ok: false; error: "unavailable" | "invalid_email" };

function parseUtm(raw: FormDataEntryValue | null): Record<string, string> | undefined {
  if (typeof raw !== "string" || raw === "") return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : undefined;
  } catch {
    // Hand-tampered or corrupted payload -- treat as "no attribution"
    // rather than failing the whole signup over a malformed side field.
    return undefined;
  }
}

function str(raw: FormDataEntryValue | null): string | undefined {
  return typeof raw === "string" && raw !== "" ? raw : undefined;
}

export async function submitWaitlist(formData: FormData): Promise<WaitlistResult> {
  const parsed = parseWaitlistInput({
    email: str(formData.get("email")),
    company: str(formData.get("company")),
    renderedAt: str(formData.get("renderedAt")),
    persona: str(formData.get("persona")),
    sourcePath: str(formData.get("sourcePath")),
    utm: parseUtm(formData.get("utm")),
  });

  if (!parsed.ok) {
    if (parsed.reason === "invalid_email") {
      return { ok: false, error: "invalid_email" };
    }
    // honeypot / too_fast: bot-shaped submission. Log for visibility but
    // report success back to the caller -- telling a bot "rejected" only
    // teaches it to adjust; a fake success is the standard anti-bot move
    // and costs a real user nothing (they'd never trip either check).
    console.error(`[waitlist] rejected bot-shaped submission (${parsed.reason})`);
    return { ok: true };
  }

  const { email, persona, sourcePath, utm } = parsed.data;

  const ip = await clientIp();
  if (!allowSubmission(ip)) {
    // Same contract as the honeypot/too-fast branch above: log it, tell the
    // caller "success". A burst past this cap is automation, and automation
    // gets nothing it can learn from.
    console.error(`[waitlist] rate limited submission from ${ip}`);
    return { ok: true };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // Credentials aren't wired up yet (this task ships code-complete
    // against env vars per its own brief) -- fail loud in the server log,
    // friendly on the client. Never throw here: an unhandled exception in
    // a Server Action surfaces as a hard error boundary, not the graceful
    // "unavailable" state WaitlistDialog is built to show.
    console.error("[waitlist] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set -- cannot store signup");
    return { ok: false, error: "unavailable" };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("waitlist_signups")
    .insert({ email, persona, source_path: sourcePath, utm });

  if (error) {
    if (error.code === "23505") {
      // Unique violation on `email` -- they're already on the list. Not a
      // failure from the user's point of view.
      return { ok: true, already: true };
    }
    console.error("[waitlist] Supabase insert failed:", error);
    return { ok: false, error: "unavailable" };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const { error: sendError } = await resend.emails.send({
        from: "KINECT <hello@kinectnow.com>",
        to: email,
        subject: waitlistEmailCopy.subject,
        // Both formats, always: `html` is the branded card (see
        // src/lib/waitlist-email.ts), `text` is the fallback for clients
        // that refuse HTML and for screen readers.
        html: waitlistEmailHtml(),
        text: waitlistEmailCopy.body,
      });
      if (sendError) {
        console.error("[waitlist] Resend confirmation email failed:", sendError);
      }
    } catch (err) {
      // The signup already succeeded above -- a broken email provider
      // should never take that success away from the user.
      console.error("[waitlist] Resend confirmation email threw:", err);
    }
    // Internal alert so a signup is not something you only discover by
    // querying the table (user-directed 2026-08-03: Jake expected one and
    // there was no such feature -- four real signups had landed silently).
    // Sent from notifications@ rather than hello@ so the message is not
    // From and To the same mailbox, with Reply-To set to the signer so a
    // reply goes straight to them. Its own try/catch: an internal alert
    // failing must never affect the visitor, who has already been stored
    // and confirmed by this point.
    try {
      const resend = new Resend(RESEND_API_KEY);
      const utmSummary =
        utm && Object.keys(utm).length > 0 ? JSON.stringify(utm) : "none";
      const { error: notifyError } = await resend.emails.send({
        from: "KINECT Waitlist <notifications@kinectnow.com>",
        to: SIGNUP_NOTIFICATION_TO,
        replyTo: email,
        subject: `New waitlist signup: ${email}`,
        text: [
          `Email:    ${email}`,
          `Lane:     ${persona ?? "unknown"}`,
          `Page:     ${sourcePath ?? "unknown"}`,
          `Campaign: ${utmSummary}`,
          "",
          "Reply to this email to reach them directly.",
        ].join("\n"),
      });
      if (notifyError) {
        console.error("[waitlist] signup notification failed:", notifyError);
      }
    } catch (err) {
      console.error("[waitlist] signup notification threw:", err);
    }
  } else {
    console.error("[waitlist] RESEND_API_KEY not set -- signup stored, confirmation email skipped");
  }

  return { ok: true };
}
