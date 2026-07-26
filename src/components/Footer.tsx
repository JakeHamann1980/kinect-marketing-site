import Link from "next/link";
import Lockup from "@/components/Lockup";
import { CookiePreferencesButton } from "@/components/ConsentBanner";
import { fetchSettings } from "@/lib/sanity";

/**
 * Social icon glyphs recovered verbatim from `design-reference/KINECT
 * Marketing Site.dc.html` (~line 471): X, LinkedIn, Instagram, YouTube,
 * each a 24x24-viewBox path rendered at 15x15 with `fill="currentColor"`
 * (Instagram is stroke-based, matching the source exactly). All four
 * currently point to "#" -- the design reference calls these "currently
 * placeholders; wire to real profiles" (README "Footer" section).
 */
const SOCIAL_ICONS: { label: string; path: React.ReactNode }[] = [
  {
    label: "X",
    path: (
      <path d="M18.9 3H21l-6.5 7.4L21.8 21h-6.3l-4.4-6-5 6H3.9l6.9-8L2.6 3h6.4l4.1 5.6zm-1.1 16h1.2L7.3 4.2H6z" />
    ),
  },
  {
    label: "LinkedIn",
    path: (
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z" />
    ),
  },
  {
    label: "Instagram",
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "YouTube",
    path: (
      <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.9 4.1 12 4.1 12 4.1h0s-4.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.8.2 6.6.2 6.6.2s4.9 0 6.7-.2c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.4V8.7l6.1 2.9z" />
    ),
  },
];

function SocialIcon({ label, path }: { label: string; path: React.ReactNode }) {
  const isStrokeIcon = label === "Instagram";
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] border border-[rgba(255,255,255,.12)] text-on-dark-4"
    >
      <svg
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill={isStrokeIcon ? "none" : "currentColor"}
        stroke={isStrokeIcon ? "currentColor" : undefined}
        strokeWidth={isStrokeIcon ? 2 : undefined}
        aria-hidden="true"
      >
        {path}
      </svg>
    </a>
  );
}

/**
 * Legal link hrefs. Per the Task 11 brief, Privacy Policy/Terms/Cookie
 * Policy already have their Task 14 destinations known now; Security joins
 * them as part of Task 14 itself (an approved-spec addition to
 * `settings.footer.legalLinks` -- the design-reference README's own footer
 * description lists "Privacy Policy, Terms and Conditions, Security, and
 * Cookie Preferences", ~line 94). DPA and Accessibility don't have a route
 * yet, so those two stay "#" with a TODO (post-launch backlog). Keyed by
 * `settings.footer.legalLinks[].label` rather than array index so a
 * reorder of that content array can't silently mismatch a link with the
 * wrong destination.
 */
const LEGAL_HREFS: Record<string, string> = {
  "Privacy Policy": "/legal/privacy",
  "Terms & Conditions": "/legal/terms",
  Security: "/legal/security",
  "Cookie Policy": "/legal/cookies",
  // TODO(Task 14 backlog): DPA and Accessibility pages don't have a route yet.
  DPA: "#",
  Accessibility: "#",
};

/**
 * Site footer (design-reference/README.md "Footer"). Dark, brand block
 * (lockup + one-line positioning + four social squares) at left, four link
 * columns pushed right; a bottom bar with copyright and legal links.
 * Stacks at 860px (see the `.kx-footer-*` rules in globals.css).
 *
 * The footer link column color (`text-on-dark-4`, i.e. `#8B95A7`) follows
 * the README's own stated value ("14px #8B95A7 links") and the Task 11
 * brief's explicit token choice; the prototype file's *rendered* footer
 * column links are `#A2ABBC` instead (closer to `on-dark-3`), which reads
 * as a handoff/prototype discrepancy rather than the intended value --
 * README wins per the established precedent.
 *
 * Task 18 (Seed Script + Page Wiring + Revalidation): footer content
 * (positioning line, columns, legal links, copyright) now comes from
 * `fetchSettings()` rather than importing `settings` directly. Unlike Nav
 * (a Client Component -- see its own doc comment for why its `settings`
 * import stays local/static), Footer is a Server Component with no props of
 * its own today, so fetching here directly is a self-contained, zero
 * -signature-change way to make its content Sanity-editable without
 * prop-drilling `settings` through home/persona/legal page.tsx (8 call
 * sites) for a value every one of them would pass identically.
 */
export default async function Footer() {
  const settings = await fetchSettings();
  const { positioning, columns, legalLinks, copyright } = settings.footer;

  return (
    // Background `#0B0F17` recovered verbatim from the prototype (~line
    // 465); it doesn't match any existing dark-surface token exactly
    // (closest is `--dark-panel` at `#0B1017`), so it's kept as an
    // explicit literal rather than approximated.
    <footer className="border-t border-[rgba(255,255,255,.08)] bg-[#0B0F17] pt-[76px] px-[60px] pb-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="kx-footer-top flex flex-wrap items-start gap-[72px] pb-[52px]">
          <div className="min-w-[250px] max-w-[290px]">
            <Lockup className="mb-[14px]" />
            {/*
              Positioning line color (#707B8E) and line-height (1.65)
              recovered verbatim from the prototype (~line 470); no
              existing token lands on that exact hex, so it's kept as an
              explicit literal rather than approximated to a nearby token.
            */}
            <p className="mb-[22px] text-[14px] leading-[1.65] text-[#707B8E]">
              {positioning}
            </p>
            <div className="flex gap-[10px]">
              {SOCIAL_ICONS.map((icon) => (
                <SocialIcon key={icon.label} label={icon.label} path={icon.path} />
              ))}
            </div>
          </div>

          <div className="kx-footer-cols ml-auto flex flex-wrap gap-16">
            {columns.map((column) => (
              <div key={column.heading}>
                <div className="mb-[15px] font-mono text-[11px] uppercase tracking-[.14em] text-on-dark-5">
                  {column.heading}
                </div>
                <div className="flex flex-col gap-[11px]">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-[14px] text-on-dark-4"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kx-footer-bar flex flex-wrap items-center gap-[26px] border-t border-[rgba(255,255,255,.07)] pt-[26px]">
          <div className="text-[13px] text-on-dark-5">{copyright}</div>
          <div className="kx-footer-legal ml-auto flex flex-wrap items-center gap-[22px]">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={LEGAL_HREFS[link.label] ?? "#"}
                className="text-[13px] text-[#707B8E]"
              >
                {link.label}
              </Link>
            ))}
            {/* Task 15: settings, not a page navigation -- reopens the
                consent banner rather than routing anywhere (see
                CookiePreferencesButton's own doc comment for why this is
                additional to, not a replacement for, the "Cookie Policy"
                link above). */}
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
