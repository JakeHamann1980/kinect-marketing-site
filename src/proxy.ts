import { NextRequest, NextResponse } from "next/server";
import { personaFromHost, PERSONAS, PERSONA_IDS, type Persona } from "@/lib/personas";

const PROD_ROOT = "kinectnow.com";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname, search } = req.nextUrl;
  const persona = personaFromHost(host);

  // www canonicalization: strip the www prefix before any other logic
  if (host === `www.${PROD_ROOT}`) {
    return NextResponse.redirect(`https://${PROD_ROOT}${pathname}${search}`, 308);
  }

  // Subdomain root → internal persona route
  if (persona) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${persona}`;
      return NextResponse.rewrite(url);
    }

    // Fix (final review, I5): one Next app serves every hostname, so
    // previously a path like agency.kinectnow.com/coach fell through to
    // "shared routes serve as-is" below and served the COACH page in place
    // with a 200 -- the URL bar said agency. while the page said coach,
    // dual-serving persona content on the wrong host. (Do not remove this
    // redirect on the theory it merely guards a 404; it exists for
    // canonicalization.)
    // Redirect both cases to the correct persona's own canonical subdomain
    // root: a *different* persona segment sends the visitor to that
    // persona's real page; the *same* persona segment canonicalizes to this
    // host's own root (e.g. agency.kinectnow.com/agency ->
    // https://agency.kinectnow.com/), matching how personaHref's relative
    // `/${persona}` paths resolve when clicked from a different persona's
    // subdomain (see src/lib/personas.ts's own doc comment on personaHref).
    //
    // Mirrors the apex branch's own narrowing below exactly (same
    // `PERSONA_IDS.includes(seg)` check, same "only the exact persona root,
    // never a deeper path" `rest === "/"` guard) so this does NOT touch:
    //   - shared routes (legal, api, studio, ph -- excluded from this
    //     middleware entirely by `config.matcher` below, so they never even
    //     reach this function), and
    //   - this persona's own deeper paths, most notably its colocated
    //     `opengraph-image` route (e.g. `/agency/opengraph-image-<hash>` on
    //     agency.kinectnow.com) -- `rest` there is the hashed suffix, not
    //     "/", so it falls through to `NextResponse.next()` and serves in
    //     place exactly as before.
    const personaSeg = pathname.split("/")[1];
    if ((PERSONA_IDS as readonly string[]).includes(personaSeg)) {
      const personaRest = pathname.slice(personaSeg.length + 1) || "/";
      if (personaRest === "/") {
        const targetHostname = PERSONAS[personaSeg as Persona].hostname;
        return NextResponse.redirect(`https://${targetHostname}/`, 308);
      }
    }

    return NextResponse.next(); // shared routes (legal, api) serve as-is
  }

  // Root domain in production: canonicalize path access to the subdomain,
  // preserving the remainder of the path and query string.
  //
  // TRIPWIRE: if a real CONTENT page is ever added under a persona segment
  // (e.g. a comparison page at /agency/vs-suitedash), revisit this
  // narrowing -- deep paths currently serve in place on the apex host with
  // no redirect to the canonical subdomain, which is fine for infra routes
  // like opengraph-image but would dual-serve a content page. Reintroduce
  // path-preserving redirects with an infra-route allowlist at that point.
  //
  // Fix (Task 21 review): this only fires for the persona's own root path
  // (`rest === "/"`) -- it used to redirect ANY path under a persona
  // segment (e.g. `/agency/whatever`) to the identical path on the
  // subdomain host, which was harmless while `/agency` had no nested
  // routes of its own. Task 21 added exactly that: each persona segment
  // now owns a colocated `opengraph-image.tsx` (Next's file-convention
  // requires the image file live under the same segment as the page it
  // decorates), reachable internally at `/agency/opengraph-image` etc.
  // `metadataBase` (src/lib/seo.ts) is deliberately pinned to the apex
  // origin, so Next resolves that route's `og:image` URL as
  // `https://kinectnow.com/agency/opengraph-image` -- exactly the shape
  // the old unconditional redirect mishandled: it 308'd that URL to
  // `https://agency.kinectnow.com/opengraph-image`, and the subdomain
  // branch above only rewrites pathname `"/"`, so that arrival path
  // served the ROOT app's home OG image instead (silently wrong, not a
  // 404 -- confirmed by diffing the two PNGs byte-for-byte while
  // verifying this task's link-preview metadata). Restricting the
  // redirect to the exact persona root and falling through to
  // `NextResponse.next()` otherwise makes any deeper path under a persona
  // segment serve in place on whichever host it's requested from --
  // the same "shared routes serve as-is" rule the subdomain branch above
  // already applies to non-root paths, now applied symmetrically here.
  const seg = pathname.split("/")[1];
  if (host === PROD_ROOT && (PERSONA_IDS as readonly string[]).includes(seg)) {
    const rest = pathname.slice(seg.length + 1) || "/";
    if (rest === "/") {
      return NextResponse.redirect(`https://${seg}.${PROD_ROOT}${rest}${search}`, 308);
    }
  }
  return NextResponse.next();
}

export const config = {
  // Exclusions are segment-anchored (e.g. `/apiary` must still hit the proxy).
  //
  // Task 15: `ph` added for the PostHog reverse-proxy rewrites
  // (next.config.ts `/ph/static/*` and `/ph/*`). Traced through every
  // branch above: `/ph/...` never matches a PERSONA_IDS segment, so on the
  // production root host it already falls through to the final
  // `NextResponse.next()`; on a persona subdomain it hits the "shared
  // routes ... serve as-is" `NextResponse.next()` for any non-"/" path.
  // Neither branch would actually rewrite or redirect a PostHog request
  // today, so this exclusion isn't fixing a live bug -- it's a disclosed,
  // defensive addition matching the existing exclusion list's own pattern
  // (skip this middleware's host/persona work entirely for known
  // infrastructure paths) so future changes to the branches above can't
  // accidentally start intercepting analytics calls, and so every
  // PostHog beacon (potentially frequent -- pageviews, autocapture) skips
  // needless middleware execution.
  matcher: [
    "/((?!(?:_next|api|studio|screenshots|ph|favicon.ico|robots.txt|sitemap.xml|llms.txt)(?:/|$)).*)",
  ],
};
