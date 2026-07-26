# KINECT Marketing Site

The public marketing site for KINECT (a client portal for agencies, coaches
and consultants): the home page, three persona subdomain pages
(`agency.`/`coach.`/`consultant.kinectnow.com`), legal pages, the waitlist
flow, and the embedded Sanity Studio that edits most of the page copy.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript.
- **Tailwind CSS v4** for styling.
- **Sanity** (`next-sanity`) as the CMS, with a local-content fallback (see
  `src/lib/sanity.ts`) so the site keeps working if Sanity is unreachable or
  unconfigured.
- **Supabase** for waitlist signup storage, **Resend** for the confirmation
  email.
- **PostHog** (consent-gated, reverse-proxied) and **Vercel Analytics**
  (cookieless) for analytics.
- **Vitest** for unit tests, **Playwright** for end-to-end tests.

## Commands

```bash
npm run dev            # start the dev server
npm run build:check    # production build + typecheck + unit tests + JSON-LD validation
npm run test:e2e       # Playwright suite against a production build
npm run test           # unit tests only (vitest)
npm run lint           # eslint
npm run seed:sanity    # seed/reseed the Sanity dataset from src/content/*
```

Run `npm run build:check && npm run test:e2e` before every deploy (see
`docs/LAUNCH.md` §0).

## Environment setup

Copy `.env.example` to `.env.local` and fill in the values described there
(PostHog key, Supabase, Resend, Sanity project/dataset, site URL). Every
integration degrades gracefully when its env vars are unset -- see each
file's own doc comment (`src/components/PostHogProvider.tsx`,
`src/app/actions/waitlist.ts`, `src/lib/sanity.ts`) -- so `npm run dev` works
with an empty `.env.local`.

To edit content in Sanity Studio: run `npm run dev` and visit `/studio`, or
run `npx sanity dev` from `sanity.config.ts`'s own workspace.

## Docs

- `docs/superpowers/specs/` -- the original design/product spec this site
  was built from.
- `docs/superpowers/plans/` -- implementation plans per task.
- `docs/LAUNCH.md` -- the pre-launch checklist (infra, data, CMS, analytics,
  SEO, legal, performance, known deferred items).
- `design-reference/README.md` -- the design handoff (section-by-section
  layout/copy source, recovered from the original prototype).
