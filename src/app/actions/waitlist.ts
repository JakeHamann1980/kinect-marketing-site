"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { parseWaitlistInput } from "@/lib/waitlist-validation";
import { waitlistEmailCopy } from "@/content/waitlist-copy";

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
  } else {
    console.error("[waitlist] RESEND_API_KEY not set -- signup stored, confirmation email skipped");
  }

  return { ok: true };
}
