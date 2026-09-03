# Storage tiers and additional-storage pricing

Decided by Jake 2026-08-03. The marketing site publishes this model, and as
of 2026-08-31 the platform implements the quota half of it. What remains is
billing: see "What exists today".

## The model

| Tier (display) | `plans.key` | Included storage |
| --- | --- | --- |
| Kinect ($149) | `starter` | 100 GB |
| Kinect Plus ($399) | `growth` | 500 GB |
| Kinect Pro ($799) | `scale` | 2 TB |

**Additional storage: $10 per 100 GB per month.**

**Soft cap, not a hard cap.** Going over the included allowance does not
block uploads. The workspace keeps working and is prompted to add a block.
This was a deliberate choice over a hard cap: a client portal that refuses a
file does so in front of the customer's own client, which is the worst
possible place for KINECT to fail. It also keeps the site's central promise
("The price is the price", "no per-seat, no per-client") intact, because
nobody is ever charged automatically for growing.

Suggested notification thresholds: 80% and 100% of the included allowance.

**Kinect Enterprise** took the fourth-tier slot on 2026-09-01, superseding
the planned "Kinect Infinity". Its allowance is **5 TB**, and the pricing page
calls it *pooled* -- one allowance shared across a firm's locations rather
than 5 TB granted per office. The platform enforces it PER WORKSPACE today
(`20260921100000_enterprise_plan.sql`), because per-workspace is the only
quota machinery that exists; pooling arrives with the org entity that
consolidated billing needs. It is explicitly **not** unlimited storage
(Jake, 2026-08-03, and still true).

## What exists today

**Most of it.** Items 1 to 5 below shipped in
`20260829100000_storage_quota.sql` (platform). Re-verified against the schema
2026-08-31:

- `public.plans.storage_limit_bytes` exists and is seeded exactly to the
  model: 100 GB, 500 GB, 2048 GB. The null-means-unlimited convention was
  followed, with a `> 0` check constraint.
- `public.subscriptions.storage_addon_blocks` counts purchased 100 GB blocks,
  modelled on the subscription rather than as a second plan, as item 2 asked.
- `public.workspace_storage` maintains a per-workspace `used_bytes` counter,
  written by an `app.track_file_bytes()` trigger rather than summed per
  request, with `app.recount_workspace_storage()` to rebuild it.
- Threshold state is tracked at 0 / 80 / 100 and rises on crossing, dropping
  back so a workspace that re-crosses is notified again.
- The cap is still SOFT. The only constraint on `storage_limit_bytes` is that
  it be positive; nothing reads it in an INSERT policy on `files` or
  `storage.objects`, exactly as item 5 requires.
- Billing surfaces usage and names purchased blocks
  (`src/components/views/billing.tsx`).

**What is still missing is the ability to buy a block.** There is no checkout
action for an add-on anywhere in the platform: `storage_addon_blocks` can be
read and displayed, but nothing a customer can click will increment it. Items
6 and 7 are untouched, and Stripe is still not connected, so this is blocked
behind the same thing everything else is.

That gap is why /pricing says "more available" on the tier cards rather than
marking them with a footnote: the additional-storage price is published in the
comparison matrix and the FAQ as a commitment, and pointing harder at a
capability with no purchase path would oversell it.

## Work required

**Platform** -- items 1 to 5 are DONE (20260829100000_storage_quota.sql).
Kept as written because they record what was asked for and why.

1. ~~Add~~ DONE. `storage_limit_bytes bigint` to `public.plans` (null = unlimited, the
   same convention `client_limit` already uses). Seed: 100 GB, 500 GB, 2 TB.
2. ~~Add~~ DONE. Per-workspace purchased add-on blocks, so the effective limit is
   `plan allowance + purchased blocks`. A count of 100 GB blocks on the
   subscription is enough; do not model it as a second plan.
3. ~~Roll up~~ DONE. Usage rolled up from `files.size_bytes` per workspace. Prefer a maintained
   counter over a `sum()` on every request.
4. ~~Surface~~ DONE. Usage is surfaced in Billing and notified at 80% and 100%.
5. HOLDING. Do **not** add an INSERT-blocking policy for storage. That would turn the
   soft cap into a hard cap and contradict what the site now publishes.
   `app.can_add_client` remains the model for hard quotas; storage is not one.

**Stripe** -- both still outstanding, and both blocked on Stripe existing.

6. Stripe is not connected at all yet, so base-tier checkout does not work.
   That has to be resolved before any add-on can be billed.
7. Create a metered or quantity-based price for the 100 GB block and store
   its id alongside the plan prices. Follow the existing separation: keys are
   historical and stable, display names are free to change.

## Sequencing caveat

The site describes this model before the platform can enforce or bill it.
That is acceptable while the site is a pre-launch waitlist and nobody can
check out, and it is the same position the three unbuilt Kinect Pro rows are
in (see the comments in `src/content/settings.ts`). It stops being
acceptable the moment a real Stripe price goes live: at that point either
enforcement ships, or these rows come off the page.
