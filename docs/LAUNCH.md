# KINECT Marketing Site — Launch Checklist

Every item lists an owner: **[Jake]** founder-only (accounts, money, legal), **[dev]** doable in a build session, **[both]** needs credentials then wiring.

## 0. Verification gate (run before every deploy)

```bash
npm run build:check && npm run test:e2e
```

`build:check` = production build + typecheck + 66 unit tests + structured-data validation against a live server. `test:e2e` = 37 Playwright tests (nav, interactions, waitlist, consent, routing, responsive) against a production build.

## 1. Infrastructure

- [ ] **[Jake]** Vercel project created; domains attached: `kinectnow.com`, `agency.`, `coach.`, `consultant.kinectnow.com` (plus `www.kinectnow.com` pointed at the same project; the proxy 308s it to apex).
- [ ] **[both]** Env vars set in Vercel (see `.env.example`): `NEXT_PUBLIC_POSTHOG_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://kinectnow.com`, Sanity vars (Task 17-18).
- [ ] **[Jake]** DNS: apex + www + three persona subdomains → Vercel.

## 2. Data & email

- [ ] **[both]** Supabase: apply `supabase/migrations/0001_waitlist.sql` to the chosen project (RLS on, no public policies — writes go through the server action only).
- [ ] **[Jake]** Resend: verify `kinectnow.com` as sending domain (SPF + DKIM records); confirm `hello@kinectnow.com` works as from-address.
- [ ] **[dev]** End-to-end waitlist test with real creds: submit → row appears in `waitlist_signups` with persona/UTM → confirmation email arrives → duplicate submit returns the "already on the list" state.

## 3. CMS (Tasks 17–18, currently pending Sanity access)

- [ ] **[Jake]** Sanity login/token for project creation.
- [ ] **[dev]** Schemas + Studio deployed; production dataset seeded from the content modules; revalidation webhook configured; Studio access granted to the team.

## 4. Analytics

- [ ] **[Jake]** PostHog: create a dedicated "KINECT marketing" project (separate from the app's); provide the project API key.
- [ ] **[dev]** With the real key: verify consent-gated init, events flowing, reverse proxy working in production (no ad-blocker losses on `/ph/*`).
- [ ] **[dev]** Build the spec §6 funnels in PostHog: core (pageview → cta_clicked → waitlist_submitted by persona/UTM source), lane-routing (home → persona_card/solutions → persona pageview → signup); launch dashboard (signups by persona, conversion by page, top UTM sources, FAQ engagement).
- [ ] **[dev]** Enable Vercel Analytics (cookieless) on the project.

## 5. Search & AI discoverability

- [ ] **[Jake]** Search Console: verify all four hostname properties; submit each host's own `/sitemap.xml` (robots.txt on each host already advertises its own sitemap).
- [ ] **[dev]** Google Rich Results Test on `/`, all three persona pages, one legal page — expect Organization, SoftwareApplication with AggregateOffer ($149–$799, 3 offers), FAQPage where applicable. (Automated JSON-LD validation already runs in `build:check`; this is the Google-side confirmation.)
- [ ] **[Jake]** Off-site action list from the spec (§8a-iii), in priority order: G2 + Capterra profiles with early reviews; entity cleanup ("KINECT client portal" naming everywhere, Wikidata attempt); listicle outreach (FuseBase/Taskip/Softr/Agiled roundups, Zapier/ClickUp blogs); disclosed Reddit participation; Product Hunt + YouTube walkthrough. See the GTM strategy doc for cadence.

## 6. Link previews

- [ ] **[dev]** Paste each page URL into Slack, LinkedIn, X, and iMessage — confirm the branded OG card renders (dark canvas, gradient headline, persona accents on persona pages). OG endpoints and absolute URLs are already test-covered; this is renderer-side QA.

## 7. Legal (blocking)

- [ ] **[Jake]** Add the company legal name and registered address to the four policies once the entity is formalized (2026-07-25: entity still forming; contact lines currently use hello@kinectnow.com, governing law set to the State of Texas).
- [ ] **[Jake]** Counsel review of all four policies (drafts match actual data practices but are not legal advice).
- [ ] Post-launch backlog: DPA and Accessibility pages (footer links currently "#").

## 8. Performance & devices

- [ ] **[dev]** Lighthouse ≥ 90 performance on `/` and one persona page, throttled mobile.
- [ ] **[Jake/dev]** Real-device pass (the design handoff flags that mobile was never verified on hardware): iPhone Safari + one Android Chrome — nav sheet, hero, cycler pinning, waitlist dialog, consent banner.

## 9. Known deferred items

- Customer logo strip: built, renders null until real logos exist (per handoff: never ship it empty).
- Screenshot re-capture from the real app once it ships (marketing must not show stale UI).
- Post-launch content roadmap (spec §8a-ii): comparison pages, "clients never open the portal" answer page, extra FAQ entries via Sanity.
- Persona-segment deep paths serve in place on the apex (Task 21 narrowing); a tripwire comment in `src/proxy.ts` flags revisiting if persona content sub-pages are ever added.
- `CTA_MODE` in `src/lib/cta.ts` flips waitlist → real signup URL when the app launches.
