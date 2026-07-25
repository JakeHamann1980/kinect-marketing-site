import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Task 15: reverse-proxy PostHog so browser calls go to our own origin
  // (`/ph/...`) instead of `*.i.posthog.com` directly -- first-party
  // requests are far less likely to be dropped by ad blockers/browser
  // tracking protection than a bare third-party call, per PostHog's own
  // documented Next.js reverse-proxy setup. `/ph/static/*` carries the
  // recorder/toolbar assets PostHog's snippet loads from its asset CDN;
  // everything else under `/ph/*` is the ingestion API. See
  // src/components/PostHogProvider.tsx's `api_host: "/ph"` for the
  // consuming side.
  async rewrites() {
    return [
      { source: "/ph/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ph/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
};

export default nextConfig;
