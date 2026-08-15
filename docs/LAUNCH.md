# KINECT Marketing Site — Launch Checklist

Every item lists an owner: **[Jake]** founder-only (accounts, money, legal), **[dev]** doable in a build session, **[both]** needs credentials then wiring.

## 0. Verification gate (run before every deploy)

```bash
npm run build:check && npm run test:e2e
```

`build:check` = production build + typecheck + unit tests + structured-data validation against a live server. `test:e2e` = 39+ Playwright tests (nav, interactions, waitlist, consent, routing, responsive) against a production build.

## 1. Infrastructure

- [x] **[Jake]** Vercel project created; domains attached: `kinectnow.com`, `agency.`, `coach.`, `consultant.kinectnow.com` (plus `www.kinectnow.com` pointed at the same project; the proxy 308s it to apex).
- [ ] **[both]** Env vars set in Vercel (see `.env.example`): `NEXT_PUBLIC_POSTHOG_KEY` and `RESEND_API_KEY` still pending; set 2026-07-27: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; set earlier: `NEXT_PUBLIC_SITE_URL=https://kinectnow.com`, `NEXT_PUBLIC_SANITY_PROJECT_ID=gxxphuan`, `NEXT_PUBLIC_SANITY_DATASET=production`, `SANITY_REVALIDATE_SECRET` (no read token needed -- the dataset is public, see `.env.example`'s own comment).
- [x] **[Jake]** DNS: apex + www + three persona subdomains → Vercel. Verified live 2026-07-27: all five hosts serve the right pages, www 308s to apex, cross-persona and apex-persona-root paths 308 to canonical subdomains, robots/sitemap are host-correct, and the nav logo on a persona subdomain crosses to `https://kinectnow.com/`. The Sanity revalidation webhook still POSTs to `https://kinect-marketing-site.vercel.app/api/revalidate` -- deliberately left alone: that alias is permanent, it is the same deployment, and `revalidateTag` clears the cache for every attached domain, so nothing is gained by re-creating the hook against the apex URL.

## 2. Data & email

- [x] **[both]** Supabase: applied 2026-07-27 — by Jake's decision the waitlist lives in the KINECT **platform** production project (`vfsfqyeazsrziyklonch`), not a separate marketing project. `waitlist_signups` created per `supabase/migrations/0001_waitlist.sql` plus one platform-specific addition: that project revokes default privileges, so it needed an explicit `grant select, insert on public.waitlist_signups to service_role;`. RLS on, no public policies.
- [ ] **[Jake]** Resend: verify `kinectnow.com` as sending domain (SPF + DKIM records); confirm `hello@kinectnow.com` works as from-address. **DNS audit 2026-08-03 — mostly done already:**
  - Receiving is fully configured: `MX 1 smtp.google.com` (Google Workspace), `v=spf1 include:_spf.google.com ~all`, a `google._domainkey` DKIM record, and `_dmarc` at `p=none` with `rua=mailto:hello@kinectnow.com`. The domain can receive mail; whether the `hello@` **alias** exists is the only open part (port 25 is blocked from the dev sandbox, so it cannot be probed here — send a mail to it, or check Workspace Admin → Users/Aliases).
  - Resend sending records are ALREADY published on the domain: `resend._domainkey` DKIM, plus `send.kinectnow.com` carrying `v=spf1 include:amazonses.com ~all` and `MX 10 feedback-smtp.us-east-1.amazonses.com`. That is the standard verified-domain setup, so this item is likely complete.
  - ⚠️ Caveat: the Resend account reachable from this dev session contains only `autix.co`, so `kinectnow.com` lives in a **different Resend account** and its verification status could not be read directly. Confirm in that account, and take `RESEND_API_KEY` from it (not from AUTIX). Same class of trap as the Supabase MCP pointing at AUTIX.
- [x] **[dev]** End-to-end waitlist test with real creds (2026-07-27): live-site submit → row in `waitlist_signups` with persona/source-path/UTM. Confirmation-email + duplicate-submit legs still pending Resend creds. NOTE: local e2e runs pin Supabase/Resend env to empty in `playwright.config.ts` so the test server can never write to the production table — done after one run did exactly that.
- [x] **[dev]** Per-IP rate limiting (2026-07-27): `src/lib/rate-limit.ts` sliding window (8 per 10 min per IP, first `x-forwarded-for` hop) wired into the server action ahead of the DB/email path; over-limit gets the same fake-success as the honeypot. Known limit: in-memory means per-serverless-instance, so a *distributed* attacker isn't globally capped — if the waitlist ever draws real abuse, upgrade to a shared store (Upstash/Supabase counter) or Vercel WAF.

## 3. CMS (Tasks 17–18)

- [x] **[Jake]** Sanity login/token for project creation.
- [x] **[dev]** Schemas + Studio deployed; `production` dataset flipped to public visibility and seeded from the content modules (`npm run seed:sanity`) with all 9 documents confirmed (`homePage`, `siteSettings`, 3 `personaPage-*`, 4 `legalPage-*`).
- [ ] **[dev]** Revalidation webhook (below) -- `sanity hooks create` requires interactive prompts (no non-interactive flags for dataset/URL/triggers/secret in this CLI version, confirmed via `--help`), so it wasn't run headlessly here. Create it once via the Sanity manage console instead:
  1. Go to `https://www.sanity.io/manage/project/gxxphuan/api/webhooks` (or `npx sanity hooks create` interactively from a terminal).
  2. **Name**: `content-revalidate` (or similar). **Dataset**: `production`.
  3. **URL**: `https://kinectnow.com/api/revalidate`.
  4. **Trigger on**: Create, Update, Delete (all three).
  5. **HTTP method**: POST. **API version**: `v2021-03-25` or later (any recent version -- the payload is just used for its `_id`).
  6. **Secret**: the exact value of `SANITY_REVALIDATE_SECRET` from the deploy's env vars (generate locally with `openssl rand -hex 32` if the one in `.env.local` shouldn't carry over to prod; either way it must byte-match what's set in Vercel).
  7. Leave "Include drafts" off (published dataset only -- this project has no draft workflow).
  8. Save, then trigger any document edit in the Studio and confirm the webhook's delivery log (same manage console page) shows a `200` from `/api/revalidate`.
- [ ] **[Jake]** Studio access granted to the team (invite collaborators in the Sanity manage console).
- **What Sanity edits do NOT reach** (read before assuming an editorial change will show up everywhere): OG images (`opengraph-image.tsx` per route -- static, code-driven, not a Sanity field); `public/llms.txt` (a static file, not generated from any fetched content); Nav chrome labels/links (`navLinks`, the Solutions dropdown rows) come from `settings` inside `src/components/Nav.tsx`, a Client Component that deliberately stays on the local content module rather than fetching Sanity client-side (see that file's own doc comment) -- editing Site Settings in the Studio changes the footer and pricing section but not the nav links or Solutions dropdown copy; and the copy-voice guardrails (`src/content/content.test.ts` -- no em dashes, no exclamation points, no emoji) only run against the local `src/content/*.ts` modules at test time, never against live Sanity content, so an editor publishing a change through the Studio gets no automated check that it still follows the voice guide -- that has to be enforced manually during editorial review.

## 4. Analytics

- [ ] **[Jake]** PostHog: create a dedicated "KINECT marketing" project (separate from the app's); provide the project API key.
- [ ] **[dev]** With the real key: verify consent-gated init, events flowing, reverse proxy working in production (no ad-blocker losses on `/ph/*`).
- [ ] **[dev]** Build the spec §6 funnels in PostHog: core (pageview → cta_clicked → waitlist_submitted by persona/UTM source), lane-routing (home → persona_card/solutions → persona pageview → signup); launch dashboard (signups by persona, conversion by page, top UTM sources, FAQ engagement).
- [x] **[dev]** Vercel Analytics (cookieless) wired in code: `@vercel/analytics` is installed and `<Analytics />` mounts in the `(site)` layout next to `PostHogProvider` (unconditional, no consent gate needed -- see `src/content/legal/cookies.ts`'s "Cookieless performance analytics" disclosure).
- [ ] **[Jake]** Remaining: enable Analytics for this project in the Vercel dashboard (Project → Analytics → Enable) so the already-mounted `<Analytics />` component actually has somewhere to report to.

## 5. Search & AI discoverability

- [ ] **[Jake]** Search Console: verify all four hostname properties; submit each host's own `/sitemap.xml` (robots.txt on each host already advertises its own sitemap).
- [ ] **[dev]** Google Rich Results Test on `/`, all three persona pages, one legal page — expect Organization, SoftwareApplication with AggregateOffer ($149–$799, 3 offers), FAQPage where applicable. (Automated JSON-LD validation already runs in `build:check`; this is the Google-side confirmation.)
- [ ] **[Jake]** Off-site action list from the spec (§8a-iii), in priority order: G2 + Capterra profiles with early reviews; entity cleanup ("KINECT client portal" naming everywhere, Wikidata attempt); listicle outreach (FuseBase/Taskip/Softr/Agiled roundups, Zapier/ClickUp blogs); disclosed Reddit participation; Product Hunt + YouTube walkthrough. See the GTM strategy doc for cadence.

## 6. Link previews

- [ ] **[dev]** Paste each page URL into Slack, LinkedIn, X, and iMessage — confirm the branded OG card renders (dark canvas, gradient headline, persona accents on persona pages). OG endpoints and absolute URLs are already test-covered; this is renderer-side QA.

## 7. Legal (blocking)

- [ ] **[Jake]** Add the company legal name and registered address to the four policies once the entity is formalized (2026-07-25: entity still forming; contact lines currently use hello@kinectnow.com, governing law set to the State of Texas).
- [ ] **[Jake]** Counsel review of all four policies (drafts match actual data practices but are not legal advice).
- [ ] Post-launch backlog: DPA and Accessibility pages (footer legal links currently "#").

## 7b. Content destinations (user-flagged 2026-07-25)

- [ ] **[Jake/dev]** Nav **Product** link goes nowhere. Either a product/features page gets designed and built, or drop the link from the nav until one exists. Currently "#" (`src/content/settings.ts` navLinks).
- [ ] **[Jake/dev]** Nav **Docs** link goes nowhere. A docs site does not exist yet (likely ships with the app, not this site). Point at the real docs URL when it exists, or drop from the nav for launch. Currently "#".

## 8. Performance & devices

- [ ] **[dev]** Lighthouse ≥ 90 performance on `/` and one persona page, throttled mobile.
- [ ] **[Jake/dev]** Real-device pass (the design handoff flags that mobile was never verified on hardware): iPhone Safari + one Android Chrome — nav sheet, hero, cycler pinning, waitlist dialog, consent banner.

## 9. Known deferred items

- Customer logo strip: built, renders null until real logos exist (per handoff: never ship it empty).
- Screenshot re-capture from the real app once it ships (marketing must not show stale UI).
- Post-launch content roadmap (spec §8a-ii): comparison pages, "clients never open the portal" answer page, extra FAQ entries via Sanity.
- Persona-segment deep paths serve in place on the apex (Task 21 narrowing); a tripwire comment in `src/proxy.ts` flags revisiting if persona content sub-pages are ever added.
- `CTA_MODE` in `src/lib/cta.ts` flips waitlist → real signup URL when the app launches.
- Recounted "#" (no real destination) links remaining after the final review round's dead-link fixes (I1/I6 fixed the footer Solutions column, Company "Security", and all four legal links; the ones below are unaddressed, no destination page exists for any of them yet):
  - Nav: "Product", "Docs" (`src/content/settings.ts` `navLinks`).
  - Footer legal: "DPA", "Accessibility" (`src/content/settings.ts` `footer.legalLinks`).
  - Footer social icons: X, LinkedIn, Instagram, YouTube (`SOCIAL_ICONS` in `src/components/Footer.tsx`) -- 4 links, no real profiles exist yet (see §5's off-site action list).
  - Also still "#", out of this round's scope: footer "Compare plans" (Solutions column), the entire Platform column (5 links), the entire Resources column (4 links), and Company "About"/"Contact"/"Status" -- none of these have a built destination page.
