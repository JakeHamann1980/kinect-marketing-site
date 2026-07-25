"use client";

import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import Lockup from "@/components/Lockup";
import Button from "@/components/Button";
import { useStuck } from "@/hooks/useStuck";
import { settings } from "@/content/settings";
import { home } from "@/content/home";
import { PERSONAS, type Persona } from "@/lib/personas";
import { cn } from "@/lib/cn";

/**
 * TODO(Task 19): production should route each Solutions/persona row to that
 * persona's own subdomain (`https://${PERSONAS[persona].hostname}/`). Until
 * environment-aware URLs are wired up (dev vs. prod host resolution), link
 * within the current app instead so the rows are functional now.
 */
function personaHref(persona: Persona): string {
  return `/${persona}`;
}

/**
 * The persona accent dot is the only markup genuinely identical between the
 * desktop dropdown rows and the mobile sheet rows -- the rows around it
 * differ (description text, padding, dividers), so only this atom is
 * extracted rather than forcing a single row component onto both shapes.
 */
function PersonaDot({
  persona,
  className,
}: {
  persona: Persona;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("h-2 w-2 flex-none rounded-full", className)}
      style={{ background: PERSONAS[persona].accent }}
    />
  );
}

/**
 * Sticky site nav: transparent over the hero, gains a blurred dark
 * background once scrolled past (see useStuck + globals.css #kx-nav rules).
 * Houses the Solutions dropdown (hover + keyboard focus) and, below 860px,
 * a hamburger-triggered full-width mobile sheet in place of the link group.
 *
 * Per design-reference/README.md "Global Elements -> Sticky transparent
 * nav": no ancestor of the sticky wrapper may use `overflow-x: hidden` (it
 * breaks `position: sticky` -- a real bug in the prototype). The root
 * layout already uses `overflow-x: clip`; nothing here adds clipping.
 */
export default function Nav() {
  const { sentinelRef, stuck } = useStuck();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsWrapRef = useRef<HTMLDivElement>(null);
  const solutionsTriggerRef = useRef<HTMLButtonElement>(null);
  // Escape closes the panel and refocuses the trigger, but refocusing the
  // trigger fires the wrapper's own onFocus (which normally opens the
  // panel), which would silently reopen what Escape just closed. This flag
  // tells the very next onFocus to no-op instead of reopening.
  const suppressReopenRef = useRef(false);

  const ctaLabel = home.hero.primaryCta;

  function closeSolutions() {
    setSolutionsOpen(false);
  }

  function openSolutionsOnFocus() {
    if (suppressReopenRef.current) {
      suppressReopenRef.current = false;
      return;
    }
    setSolutionsOpen(true);
  }

  function handleSolutionsBlur(e: FocusEvent<HTMLDivElement>) {
    // Only close once focus leaves the whole trigger+panel wrapper, not
    // when it moves between rows inside it.
    if (!solutionsWrapRef.current?.contains(e.relatedTarget as Node | null)) {
      closeSolutions();
    }
  }

  function handleSolutionsKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Escape-only: closing via mouseleave/blur is the pointer/focus-out
    // path leaving elsewhere, so it must not steal focus. Escape is the
    // one case where the panel closes out from under a keyboard user
    // (who may be focused several rows deep), so it also has to put focus
    // back on the trigger rather than stranding it on <body>.
    if (e.key === "Escape") {
      suppressReopenRef.current = true;
      closeSolutions();
      solutionsTriggerRef.current?.focus();
    }
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <span ref={sentinelRef} style={{ display: "block", height: 1 }} />
      <div style={{ position: "sticky", top: 0, zIndex: 40 }}>
        <nav
          id="kx-nav"
          className={cn(
            "flex items-center gap-[14px] px-[60px] py-[22px]",
            stuck && "kx-stuck",
          )}
        >
          <Lockup />

          <div className="kx-nav-links">
            <div
              ref={solutionsWrapRef}
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={closeSolutions}
              onFocus={openSolutionsOnFocus}
              onBlur={handleSolutionsBlur}
              onKeyDown={handleSolutionsKeyDown}
            >
              <button
                ref={solutionsTriggerRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={solutionsOpen}
                aria-controls="kx-solutions-panel"
                // Idempotent open, not a toggle: hover/focus already open the
                // panel, so a click that follows a hover (as real pointer
                // input does) must not immediately close what it just
                // opened. Closing is handled by mouseleave/blur/Escape.
                onClick={() => setSolutionsOpen(true)}
                className="flex cursor-pointer items-center gap-[7px] border-none bg-transparent p-0 font-sans text-[15px] text-on-dark-2"
              >
                Solutions
                <span aria-hidden="true" className="text-[10px] opacity-70">
                  ▾
                </span>
              </button>

              {solutionsOpen && (
                <div
                  id="kx-solutions-panel"
                  className="absolute left-0 top-[26px] w-[300px] rounded-[14px] border border-[rgba(255,255,255,.1)] bg-dropdown-bg p-2 shadow-[0_24px_60px_rgba(0,0,0,.5)]"
                >
                  {settings.solutions.map((s) => (
                    <Link
                      key={s.persona}
                      href={personaHref(s.persona)}
                      onClick={closeSolutions}
                      className="flex items-start gap-[11px] rounded-[10px] px-3 py-[11px] hover:bg-[rgba(255,255,255,.06)]"
                    >
                      <PersonaDot persona={s.persona} className="mt-[6px]" />
                      <span className="min-w-0">
                        <span className="block font-sans text-[15px] font-semibold text-on-dark">
                          {s.name}
                        </span>
                        <span className="mt-[2px] block font-sans text-[12.5px] leading-[1.45] text-on-dark-4">
                          {s.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {settings.navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-sans text-[15px] text-on-dark-2"
              >
                {link.label}
              </Link>
            ))}

            <Button variant="primary" href="/">
              {ctaLabel}
            </Button>
          </div>

          <button
            type="button"
            className="kx-burger"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            aria-controls="kx-mobile-sheet"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="kx-burger-line" />
            <span className="kx-burger-line" />
            <span className="kx-burger-line" />
          </button>
        </nav>

        {mobileOpen && (
          <div
            id="kx-mobile-sheet"
            className="kx-mobile-sheet border-b border-[rgba(255,255,255,.1)] bg-dropdown-bg px-5 pt-[10px] pb-5"
          >
            {settings.solutions.map((s) => (
              <Link
                key={s.persona}
                href={personaHref(s.persona)}
                onClick={closeMobile}
                className="flex min-h-[52px] items-center gap-[11px] border-b border-[rgba(255,255,255,.07)] py-[15px]"
              >
                <PersonaDot persona={s.persona} />
                <span className="font-sans text-base font-semibold text-on-dark">
                  {s.name}
                </span>
              </Link>
            ))}

            {settings.navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobile}
                className="flex min-h-[52px] items-center border-b border-[rgba(255,255,255,.07)] py-[15px] font-sans text-base text-on-dark-2"
              >
                {link.label}
              </Link>
            ))}

            <Button
              variant="primary"
              href="/"
              className="mt-4 w-full"
              onClick={closeMobile}
            >
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
