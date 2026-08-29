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
