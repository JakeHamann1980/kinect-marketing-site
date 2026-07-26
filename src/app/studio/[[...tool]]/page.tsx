/**
 * Task 17 (Sanity Schemas + Studio). Embeds Sanity Studio at /studio using
 * next-sanity's NextStudio, per the standard "embedded Next.js Studio"
 * pattern. The catch-all `[[...tool]]` segment lets Studio's internal
 * router (structure tool, vision tool, etc.) handle sub-routes under
 * /studio/*. `next.config.ts`'s proxy matcher (src/proxy.ts) already
 * excludes "studio" from the persona-subdomain rewrite, so this route is
 * reachable unmodified on the root host.
 *
 * `"use client"` here (rather than only inside next-sanity's own
 * `NextStudio` component) is load-bearing under Turbopack: without it,
 * Next treats this route segment's module graph -- including the
 * `sanity.config` import and everything `sanity`/`structureTool` pull in --
 * as Server Component code, and Turbopack resolves those deps' package
 * exports against the `react-server` condition. Sanity's Studio internals
 * (via `swr`) don't ship a `react-server` build with the same exports,
 * which fails the production build with an "Export default doesn't exist"
 * error from `swr/dist/index/react-server.mjs`. Forcing this whole file
 * into the client graph avoids that condition entirely.
 */
"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
