"use client";

import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import Lockup from "@/components/Lockup";
import TrackedLink from "@/components/TrackedLink";
import WaitlistCta from "@/components/WaitlistCta";
import { useStuck } from "@/hooks/useStuck";
import { settings } from "@/content/settings";
import { visibleLinks } from "@/lib/draft-pages";
import { signupUrl } from "@/lib/checkout";
import { home } from "@/content/home";
import { PERSONAS, personaHref, type Persona } from "@/lib/personas";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

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
 * user-directed 2026-08-03: draft destinations (today: "Docs") are hidden
 * on the live site and appear only with NEXT_PUBLIC_ENABLE_DRAFT_PAGES=1.
 * Computed once at module scope -- the flag is inlined at build time, so
 * this never changes between renders.
 */
const NAV_LINKS = visibleLinks(settings.navLinks);

interface NavProps {
  /**
   * Persona subdomain badge shown next to the wordmark (e.g. "for
   * Agencies"), recovered from `KINECT Marketing Site.dc.html`'s
   * `subNames`/`subLabelStyle` (~line 660/690): a small mono uppercase
   * pill, accent-colored text on an accent-tinted background. Home passes
   * nothing so the badge is omitted there, matching the prototype's own
   * `subLabel:page==='home'?'':subNames[page]` behavior. Uses the
   * `--accent`/`--accent-tint` CSS vars (set per page via `[data-persona]`
   * on the page root) rather than a hardcoded per-persona color table, so
   * it follows whichever persona the page root declares automatically,
   * same mechanism as AsteriskMark/Lockup's own `var(--accent)` default.
   */
  badge?: string;
  /**
   * Pages with no dark hero behind the nav (e.g. the light legal pages)
   * pass true so the nav always wears its solid "stuck" treatment; the
   * transparent-at-top behavior only makes sense over a dark canvas.
   */
  forceSolid?: boolean;
}

/**
 * Task 18 (Seed Script + Page Wiring + Revalidation) content boundary: Nav
 * keeps its direct `settings`/`home` imports rather than fetching from
 * Sanity. Nav is a Client Component (`"use client"` above), so wiring it to
 * Sanity would mean either fetching client-side (an extra request +
 * loading-state complexity for content that never changes per visit) or
 * threading `navLinks`/`solutions`/the CTA label down as props from every
 * page that mounts Nav/PersonaPage -- invasive for what is near-static site
 * chrome (three nav links, three solutions rows, one CTA label), not
 * per-page marketing copy. The controller's explicit call: page BODY
 * content (hero, cards, FAQ, pricing, legal prose, SEO -- see
 * src/lib/sanity.ts's fetchers) comes from Sanity; this chrome stays local
 * for now. Making it Sanity-editable too is a reasonable follow-up (e.g. a
 * small client-side fetch with a static-content cache, or lifting Nav's
 * data need into a server-rendered slot), just out of scope here.
 *
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
export default function Nav({ badge, forceSolid = false }: NavProps) {
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
      {/* user-directed 2026-07-25: the skip-to-content link (added by the
          final review's a11y pass, M7) was removed at Jake's direction after
          it kept surfacing during normal navigation. The `<main id="main">`
          landmarks remain on every page for assistive-tech users. */}
      <span ref={sentinelRef} style={{ display: "block", height: 1 }} />
      {/* height: 0 removes the wrapper from flow height so the hero canvas
          extends up behind the transparent nav (the prototype achieves the
          same overlay with margin-bottom: -84px on #kx-navwrap; height 0 is
          exact at every breakpoint instead of hardcoding the nav height). */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, height: 0 }}>
        <nav
          id="kx-nav"
          className={cn(
            "flex items-center gap-[14px] px-[60px] py-[22px]",
            (stuck || forceSolid) && "kx-stuck",
          )}
        >
          <div className="flex items-center gap-2">
            <Lockup />
            {badge ? (
              <span
                className="rounded-[6px] px-[9px] py-1 font-mono text-[11px] uppercase tracking-[.1em]"
                style={{ color: "var(--accent)", background: "var(--accent-tint)" }}
              >
                {badge}
              </span>
            ) : null}
          </div>

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
                /* The outer div's padding bridges the visual gap between the
                   trigger and the panel so the pointer never crosses a zone
                   outside the hover wrapper on its way down (which would fire
                   mouseleave and close the panel mid-travel). */
                <div className="absolute left-0 top-full pt-[4px]">
                <div
                  id="kx-solutions-panel"
                  className="w-[300px] rounded-[14px] border border-[rgba(255,255,255,.1)] bg-dropdown-bg p-2 shadow-[0_24px_60px_rgba(0,0,0,.5)]"
                >
                  {settings.solutions.map((s) => (
                    <Link
                      key={s.persona}
                      href={personaHref(s.persona)}
                      onClick={() => {
                        track("solutions_nav_clicked", { persona: s.persona });
                        closeSolutions();
                      }}
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
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-sans text-[15px] text-on-dark-2"
              >
                {link.label}
              </Link>
            ))}

            {/* Task 16: "Start free" -- see WaitlistCta.tsx's own doc
                comment. Replaces the prior placeholder `href="/"` Button. */}
            {/* user-directed 2026-08-03: primary CTAs hand off to app signup
                (the waitlist is closed). See src/lib/checkout.ts. */}
            <TrackedLink href={signupUrl()} variant="primary" trackLocation="nav">
              {ctaLabel}
            </TrackedLink>
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
                onClick={() => {
                  track("solutions_nav_clicked", { persona: s.persona });
                  closeMobile();
                }}
                className="flex min-h-[52px] items-center gap-[11px] border-b border-[rgba(255,255,255,.07)] py-[15px]"
              >
                <PersonaDot persona={s.persona} />
                <span className="font-sans text-base font-semibold text-on-dark">
                  {s.name}
                </span>
              </Link>
            ))}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobile}
                className="flex min-h-[52px] items-center border-b border-[rgba(255,255,255,.07)] py-[15px] font-sans text-base text-on-dark-2"
              >
                {link.label}
              </Link>
            ))}

            <TrackedLink href={signupUrl()}
              variant="primary"
              className="mt-4 w-full"
              trackLocation="mobile-sheet"
              onClick={closeMobile}
            >
              {ctaLabel}
            </TrackedLink>
          </div>
        )}
      </div>
    </>
  );
}
