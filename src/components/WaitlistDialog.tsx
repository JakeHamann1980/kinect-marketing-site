"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Button from "@/components/Button";
import { track, firstTouchUtms, currentPersona } from "@/lib/analytics";
import { onOpenWaitlist, type OpenWaitlistDetail } from "@/lib/cta";
import { parseWaitlistInput } from "@/lib/waitlist-validation";
import { submitWaitlist } from "@/app/actions/waitlist";
import { waitlistDialogCopy as COPY } from "@/content/waitlist-copy";

type Status = "idle" | "submitting" | "success" | "already" | "error";

/**
 * Task 16 (waitlist): the modal every "Start free" CTA opens (see
 * WaitlistCta.tsx/cta.ts). Mounted exactly once, in the root layout, as a
 * sibling of everything else (same "fixed-position overlay, not a child of
 * whatever triggered it" shape as ConsentBanner) -- WaitlistCta.tsx never
 * renders this directly, it only dispatches the `kx-open-waitlist` window
 * event this component listens for.
 *
 * Accessibility contract this component owns:
 *  - `role="dialog"` + `aria-modal="true"`, labelled by its own heading via
 *    `aria-labelledby` (a generated `useId()`, not a hardcoded string, so
 *    nothing collides if this component were ever mounted twice).
 *  - Focus moves onto the email input the moment the dialog opens, and
 *    returns to whatever element had focus right before it opened (the CTA
 *    button the user clicked) the moment it closes -- `openerRef` captures
 *    `document.activeElement` synchronously inside the `kx-open-waitlist`
 *    handler, i.e. before this component's own state update touches focus
 *    at all.
 *  - Escape closes (handled via the panel's own onKeyDown -- focus is
 *    always inside the panel by construction, so this bubbles up from
 *    whatever field currently has focus without needing a separate
 *    document-level listener).
 *  - A basic Tab focus trap on the same handler: Tab from the last
 *    focusable element wraps to the first, Shift+Tab from the first wraps
 *    to the last.
 *  - Clicking the backdrop (not the panel itself) closes -- checked via
 *    `e.target === e.currentTarget` on the backdrop's own onMouseDown, so a
 *    mousedown that starts inside the panel and drags out doesn't
 *    spuriously close it.
 *
 * Validation: `handleSubmit` runs the shared `parseWaitlistInput` (see
 * src/lib/waitlist-validation.ts) client-side before ever calling the
 * server action, so an obviously malformed email gets an instant,
 * no-network error. The server action re-runs the exact same function
 * against the posted FormData regardless -- this is a UX nicety, never the
 * actual gate; see handleSubmit's own comment for why honeypot/too_fast
 * are deliberately NOT short-circuited the same way.
 */
export default function WaitlistDialog() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<OpenWaitlistDetail>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [renderedAt, setRenderedAt] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const headingId = useId();
  const emailId = useId();

  useEffect(() => {
    return onOpenWaitlist((openDetail) => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDetail(openDetail);
      setStatus("idle");
      setErrorMessage("");
      setRenderedAt(Date.now());
      setOpen(true);
      track("waitlist_opened", { location: openDetail.location });
    });
  }, []);

  // Autofocus on open. A plain focus() call, not a setState -- fine inside
  // an effect body (only setState-in-effect-body is the lint-flagged
  // pattern this codebase avoids, see ConsentBanner.tsx's own doc comment).
  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    openerRef.current?.focus();
  }

  function handlePanelKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;
    // Broad element-type query, then filter by the actual DOM `tabIndex`
    // property (not an attribute-selector guess) -- this is what correctly
    // excludes both the hidden `renderedAt` input (`type="hidden"` is never
    // in tab order) and the honeypot (`tabIndex={-1}` in the JSX below) from
    // the trap's first/last calculation, matching real Tab-key behavior.
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]"),
    ).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.tabIndex >= 0 &&
        (el as HTMLInputElement).type !== "hidden",
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) close();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const email = emailRef.current?.value ?? "";
    const company = honeypotRef.current?.value ?? "";
    const submissionRenderedAt = renderedAt ?? Date.now();
    const persona = currentPersona();
    const sourcePath = window.location.pathname;
    const utm = firstTouchUtms();

    // Client pre-flight: the exact same parseWaitlistInput the server action
    // re-runs (see that module's own doc comment -- this is the "friendly
    // pre-flight check before even hitting the network" it already
    // promised). Only `invalid_email` short-circuits here, with an instant,
    // no-network error -- honeypot/too_fast still go to the server, which
    // is where those are actually enforced (never trust a client-only
    // anti-bot check; showing a bot-specific message this early would also
    // just teach it what tripped). The server remains the authoritative
    // gate either way: this only saves a genuine typo a round trip.
    const preflight = parseWaitlistInput({
      email,
      company,
      renderedAt: submissionRenderedAt,
      persona,
      sourcePath,
      utm,
    });
    if (!preflight.ok && preflight.reason === "invalid_email") {
      setStatus("error");
      setErrorMessage(COPY.errorInvalidEmail);
      return;
    }

    setStatus("submitting");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("company", company);
    formData.set("renderedAt", String(submissionRenderedAt));
    formData.set("persona", persona);
    formData.set("sourcePath", sourcePath);
    formData.set("utm", JSON.stringify(utm));

    const result = await submitWaitlist(formData);

    if (result.ok) {
      setStatus(result.already ? "already" : "success");
      track("waitlist_submitted", { already: Boolean(result.already), location: detail.location });
    } else {
      setStatus("error");
      setErrorMessage(
        result.error === "unavailable" ? COPY.errorUnavailable : COPY.errorInvalidEmail,
      );
    }
  }

  if (!open) return null;

  const showForm = status === "idle" || status === "submitting" || status === "error";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={handlePanelKeyDown}
        className="w-full max-w-[440px] rounded-[14px] border border-[rgba(255,255,255,.1)] bg-dropdown-bg p-6 shadow-[0_24px_60px_rgba(0,0,0,.5)]"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={headingId} className="font-display text-[21px] font-bold text-on-dark">
            {COPY.heading}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex-none text-[15px] text-on-dark-4"
          >
            {"✕"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <p className="text-[15px] leading-[1.5] text-on-dark-3">{COPY.intro}</p>

            <div>
              <label htmlFor={emailId} className="mb-[6px] block text-[13px] text-on-dark-4">
                {COPY.emailLabel}
              </label>
              <input
                ref={emailRef}
                id={emailId}
                type="email"
                name="email"
                required
                disabled={status === "submitting"}
                className="w-full rounded-[10px] border border-[rgba(255,255,255,.18)] bg-transparent px-3 py-[10px] text-[15px] text-on-dark outline-none"
              />
            </div>

            {/* Honeypot: real visitors never see or focus this field --
                aria-hidden removes it from the accessibility tree, tabIndex
                -1 removes it from tab order, autoComplete off stops a
                browser from ever pre-filling it on a human's behalf. Only
                a bot filling every input it can find trips this. */}
            <input
              ref={honeypotRef}
              type="text"
              name="company"
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
                opacity: 0,
                pointerEvents: "none",
              }}
            />

            {/* Hidden timestamp, captured client-side the moment the
                dialog opened (see the kx-open-waitlist handler above) --
                type="hidden" keeps it out of both the tab order and the
                accessibility tree with no extra attributes needed. Read
                from component state (not this element) at submit time;
                kept in the markup too so the value driving the
                too-fast/honeypot check is visible in the DOM, not only in
                memory. */}
            <input type="hidden" name="renderedAt" value={renderedAt ?? ""} readOnly />

            {status === "error" ? (
              <p role="alert" className="text-[14px] text-coral-light">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? COPY.submitPending : COPY.submitIdle}
            </Button>
          </form>
        ) : (
          <div className="mt-4 text-[15px] leading-[1.5] text-on-dark-3">
            <p>{status === "already" ? COPY.already : COPY.success}</p>
            {status === "success" ? <p className="mt-2">{COPY.successNext}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
