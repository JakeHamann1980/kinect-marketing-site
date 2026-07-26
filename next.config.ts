import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Screenshots as Sanity image fields (2026-07-25): product screenshots
  // now resolve to dereferenced cdn.sanity.io URLs (see src/lib/sanity.ts's
  // SCREENSHOT_PROJECTION) rather than only local /screenshots/*.png paths,
  // so next/image needs this host allow-listed or it 400s. `search` is
  // pinned to the exact `?auto=format` query string the projection always
  // appends (see this version's stricter remotePatterns doc,
  // node_modules/next/dist/docs/.../images.md "Query Strings") rather than
  // left unset -- unset also works (an implicit `**` wildcard) but is
  // explicitly flagged there as "not recommended" since it would optimize
  // any query string, not just the one this app ever produces.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
        search: "?auto=format",
      },
    ],
  },
  // Task 15: reverse-proxy PostHog so browser calls go to our own origin
  // (`/ph/...`) instead of `*.i.posthog.com` directly -- first-party
  // requests are far less likely to be dropped by ad blockers/browser
  // tracking protection than a bare third-party call, per PostHog's own
  // documented Next.js reverse-proxy setup. `/ph/static/*` carries the
  // recorder/toolbar assets PostHog's snippet loads from its asset CDN;
  // everything else under `/ph/*` is the ingestion API. See
  // src/components/PostHogProvider.tsx's `api_host: "/ph"` for the
  // consuming side.
  //
  // `/ph/array/*` (post-launch fix, adversarial review 2026-07-25): added
  // ahead of the general `/ph/*` catch-all -- Next applies these rules in
  // order and stops at the first match, so a more specific prefix must
  // precede a broader one it would otherwise shadow. PostHog's own SDK
  // requests its remote bootstrap config from this exact path at startup
  // on every session (`/array/<token>/config` and `/array/<token>/config.js`),
  // and routes it through its "assets" endpoint category, not the
  // ingestion API -- confirmed directly in the installed package,
  // node_modules/posthog-js/dist/module.js: `t.requestRouter.endpointFor
  // ("assets", "/array/" + t.config.token + "/config.js")` (and the JSON
  // `/config` variant is fetched the same way by the SDK's remote-config
  // loader). Before this fix, the general `/ph/*` rule below caught
  // `/ph/array/*` first and forwarded it to the ingestion host
  // (`us.i.posthog.com`), which doesn't serve that path -> a 404 on every
  // session's bootstrap request.
  async rewrites() {
    return [
      { source: "/ph/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ph/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ph/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
};

export default nextConfig;
