# Kinect Pro: what the page sells vs what exists

Scoped 2026-08-03, against the platform repo at commit `12266e5`. Written
because `scale` now has a live Stripe price (`price_1U8uW6…`), so the three
Pro-exclusive rows on /pricing are things a customer can pay $799/month for
today.

## Status of each claim

| Page claim | Reality |
| --- | --- |
| "Your own domain and branding" | **Half built.** Branding is REAL: `workspaces.logo_url` + `accent_color`, a public `workspace-logos` bucket, applied to documents, the public `/d/<token>` page and emails (migration `20260828100000_workspace_branding.sql`). Custom domains do NOT exist — a workspace is resolved by slug on app.kinectnow.com. |
| "SSO and enforced two-factor" | **Half built.** Two-factor is REAL: `/login/mfa` with challenge→verify, and the middleware enforces AAL ("THIS IS THE LOCK"). What is missing is the word ENFORCED — there is no workspace-level requirement, so 2FA is per-user opt-in. `workspaces` has no `mfa_required` column. SAML SSO does not exist at all. |
| "Multiple workspaces under one bill" | **Not built.** `subscriptions.workspace_id` is one row per workspace, so every workspace bills separately. |

## Effort, smallest first

**1. Enforced two-factor — SMALL.** The hard part (enrolment, challenge,
verify, AAL enforcement) already ships. Missing: a `workspaces.mfa_required`
boolean, an admin toggle, and a middleware branch sending un-enrolled members
of a requiring workspace to enrolment before anything else. Days, not weeks,
and it makes a currently-false claim true.

**2. Custom domain — LARGE, and scope-sensitive.** Needs per-customer CNAME,
TLS issuance and renewal, host→workspace resolution in middleware, and
Supabase auth redirect allowlisting per domain. The cost hinges on one
question: does the OPERATOR need to log in at the custom domain, or only the
CLIENT? If client-facing only, the public `/d/<token>` document surface is
already token-authenticated and unauthenticated, which avoids the
session-cookie problem entirely and shrinks this by an order of magnitude.
Full multi-domain auth is the expensive version.

**3. SAML SSO — MEDIUM-LARGE, and questionable for this ICP.** Supabase
supports SAML but it needs a paid plan tier, per-tenant IdP configuration and
domain→tenant mapping. Buyers who ask for SSO usually also expect SCIM
provisioning, which is a separate build. Agencies, studios and solo
consultants rarely run an IdP; this is an enterprise checkbox on an SMB
product.

**4. Multiple workspaces under one bill — LARGE, highest risk.** Requires a
billing entity ABOVE workspace, with the subscription attached to it, plus
changes to webhook attribution, `workspaces.plan` resolution, and every quota
check that reaches plan through workspace — which now includes storage. It
reshapes the billing core rather than adding to it.

## Recommendation

Build (1) and rewrite the rows to match reality. That yields a Pro tier that
is entirely true today:

- 2 TB storage (real, enforced)
- Your own logo and colour on client-facing documents (real)
- Enforced two-factor for the whole workspace (real once (1) ships)
- Priority support

Then defer (2), (3) and (4) until a customer actually asks. Custom domains
are the only one with real pull for this ICP, and even that should be scoped
to the client-facing surface first.

Until (1) ships and the copy is rewritten, `scale` should not carry a live
Stripe price — or the three rows come off the page. Pro is otherwise
differentiated from Plus by storage alone.

---

# Build specs for the four "coming soon" items

Added 2026-08-03 after the pricing page began labelling these `Soon`. Facts
below were verified against the platform repo, not assumed.

## 1. Workspace-wide two-factor requirement — SMALL, do this first

Two-factor already works end to end: `supabase.auth.mfa` enrolment, a
`/login/mfa` challenge screen, and the middleware calling
`getAuthenticatorAssuranceLevel()` and redirecting an `aal1` session whose
`nextLevel` is `aal2`. What is missing is only the ability for an ADMIN to
require it.

- `alter table public.workspaces add column mfa_required boolean not null
  default false`, admin-only via the existing RLS arrangement.
- Admin toggle in workspace settings. `workspace_members.role` already
  distinguishes admins, and `requireAdmin()` already gates actions.
- Middleware: today it only gates a session that has ALREADY enrolled
  (`nextLevel === "aal2"`). Requirement means also catching a member with NO
  factor in a requiring workspace and sending them to enrolment. That is a
  second branch beside `mfaRedirect`, not a rewrite.
- Do not lock out the admin who enables it: enrol the enabling admin first,
  or the toggle strands the workspace.
- The pricing page says this is Pro-only. Nothing in the schema gates
  features by plan except `client_limit` and `storage_limit_bytes`, so
  gating this needs a plan check where the toggle is read.

## 2. Custom domain — LARGE, and the scope hinges on one question

The middleware does **no host inspection at all** — a workspace is resolved
purely from the `/[workspace]` path segment. So this is new capability, not a
configuration change.

**Ask first: does the OPERATOR sign in on the custom domain, or only the
CLIENT?** The answer changes the size by an order of magnitude.

- *Client-facing only* (recommended first cut): point the domain at the
  public `/d/<token>` document surface, which is token-authenticated and
  needs no session cookie. Host→workspace lookup, a `workspace_domains`
  table, and Vercel domain provisioning via API. No auth work.
- *Full operator login on the domain*: adds Supabase redirect-URL
  allowlisting per tenant, cookie-domain handling, and email links that must
  generate per-domain. This is where the weeks go.

Either way: a `workspace_domains` table (workspace_id, hostname, verified_at),
DNS verification, and automated TLS. Treat cert renewal as the operational
risk, not the build.

## 3. SSO — MEDIUM-LARGE, and likely the wrong bet for this ICP

Supabase supports SAML, but it needs a paid plan tier, per-tenant IdP
registration, and a domain→tenant mapping so a user typing their work email
reaches the right IdP. Buyers who ask for SSO usually also expect SCIM
provisioning, which is a separate build with its own lifecycle rules
(deprovisioning especially).

Agencies, studios and solo consultants rarely run an IdP. Recommend leaving
this last, and only building it against a named customer who has asked.

## 4. Multiple workspaces under one bill — LARGE, highest blast radius

`subscriptions` is keyed one row per `workspace_id`, and `workspaces.plan`
mirrors it. Every plan-derived limit reaches plan THROUGH the workspace —
`client_limit`, and now `storage_limit_bytes` and the storage add-on blocks.

Doing this properly means introducing a billing entity above workspace (an
org or account), moving the subscription onto it, and rewriting: webhook
attribution (`metadata.workspace_id` becomes an org id, and the existing
comment about diffing the right row applies double), plan resolution, and
every quota read. Storage makes this worse than it was a month ago, because
a shared quota across N workspaces is a different product decision, not just
a schema change: is 2 TB per workspace, or 2 TB pooled?

Answer that product question before any schema work. Recommend deferring
until there is a customer with more than one workspace who is asking to
consolidate billing.

## Suggested order

1 → 2 (client-facing cut) → stop and reassess. 3 and 4 should wait for
demand, and the page already says `Soon` rather than promising a date.
