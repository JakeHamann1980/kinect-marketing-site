import PostHogProvider from "@/components/PostHogProvider";
import ConsentBanner from "@/components/ConsentBanner";
import WaitlistDialog from "@/components/WaitlistDialog";
import JsonLd from "@/components/JsonLd";
import { organizationLd, websiteLd, softwareApplicationLd } from "@/lib/jsonld";

/**
 * Task 17 (Sanity Schemas + Studio): marketing-site chrome moved here from
 * the root layout so it applies only to the `(site)` route group (home,
 * persona pages, legal pages) -- not to `/studio`, which is a sibling route
 * outside this group and therefore only inherits the root layout's bare
 * `<html>`/`<body>`. Before this split, every route (including the embedded
 * Sanity Studio) rendered underneath the cookie-consent banner and waitlist
 * dialog, since the App Router has exactly one root layout and nested
 * layouts can't be "opted out of" by a route that shares it -- the fix is
 * to keep the root layout minimal and scope this chrome to the route group
 * that actually needs it.
 *
 * This layout intentionally has no `<html>`/`<body>` (only the root layout
 * may define those) and forwards its own children through unchanged aside
 * from the JsonLd scripts and the two fixed-position overlays.
 */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Task 20: Organization + WebSite + SoftwareApplication JSON-LD
          mounted for every marketing page (not /studio) -- these describe
          the KINECT entity/product itself, not any one page's content, per
          spec §8b ("Organization (shared @id + sameAs across all four
          hostnames), WebSite, SoftwareApplication with AggregateOffer ...
          site-wide"). FAQPage JSON-LD is per-page instead (home + persona
          pages only, see their own page components) since legal pages carry
          no FAQ content. */}
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />
      <JsonLd data={softwareApplicationLd()} />

      {/* Task 15: PostHogProvider wraps every marketing page so it can apply
          already-recorded consent (and react to live changes) regardless of
          which route mounts first; ConsentBanner is a sibling, not a child,
          since it renders its own fixed-position UI rather than wrapping
          page content. Task 16: WaitlistDialog is the same shape -- a
          fixed-position overlay mounted once here, opened by any "Start
          free" CTA anywhere in the tree via the kx-open-waitlist window
          event (see cta.ts). */}
      <PostHogProvider>{children}</PostHogProvider>
      <ConsentBanner />
      <WaitlistDialog />
    </>
  );
}
