/**
 * Task 16 (waitlist): the one place submission rules live, shared by
 * WaitlistDialog.tsx (a friendly pre-flight check before even hitting the
 * network) and src/app/actions/waitlist.ts (the real gate -- client checks
 * are UX only, never trusted; the server action re-runs this same function
 * against the submitted FormData). Pure and synchronous on purpose: no
 * network, no DOM, so it is trivially unit-testable and safe to import from
 * both a "use client" component and a "use server" action.
 */

export interface WaitlistInput {
  email?: string;
  /** Honeypot field. Real visitors never see or focus it (see
   * WaitlistDialog.tsx); anything other than empty/whitespace here is a bot
   * signal. */
  company?: string;
  /**
   * Ms-epoch timestamp captured client-side the moment the dialog opened.
   * FormData always delivers this as a string, so both `number` (tests,
   * direct calls) and `string` (the real submission path) are accepted.
   */
  renderedAt?: number | string;
  persona?: string;
  sourcePath?: string;
  utm?: Record<string, string>;
}

export interface WaitlistData {
  email: string;
  persona?: string;
  sourcePath?: string;
  utm?: Record<string, string>;
}

export type WaitlistParseResult =
  | { ok: true; data: WaitlistData }
  | { ok: false; reason: "invalid_email" | "honeypot" | "too_fast" };

/**
 * Deliberately basic ("RFC-ish"), not a full RFC 5322 implementation: one
 * `@`, no whitespace on either side, at least one `.` in the domain part.
 * Good enough to reject obvious typos/garbage without the false-negative
 * risk of a stricter pattern rejecting a real address.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A submission is "too fast" (bot-shaped) unless the dialog was visibly
 * open for at least this long before the form posted. */
const MIN_HUMAN_DELAY_MS = 2000;

export function parseWaitlistInput(input: WaitlistInput, now: number = Date.now()): WaitlistParseResult {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, reason: "invalid_email" };
  }

  if ((input.company ?? "").trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const renderedAt = typeof input.renderedAt === "string" ? Number(input.renderedAt) : input.renderedAt;
  if (typeof renderedAt !== "number" || Number.isNaN(renderedAt) || now - renderedAt < MIN_HUMAN_DELAY_MS) {
    return { ok: false, reason: "too_fast" };
  }

  return {
    ok: true,
    data: {
      email,
      persona: input.persona,
      sourcePath: input.sourcePath,
      utm: input.utm,
    },
  };
}
