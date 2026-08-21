# Storage tiers and additional-storage pricing

Decided by Jake 2026-08-03. The marketing site now publishes this model.
**The platform does not implement any of it yet**, and this document is the
spec for closing that gap.

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

**Kinect Infinity** is a planned fourth tier. Its storage allowance is
deliberately undecided, and it is explicitly **not** unlimited storage
(Jake, 2026-08-03). Do not assume unlimited when scoping it.

## What exists today

Nothing. Verified 2026-08-03 across the platform repo and its database:

- `public.plans` has exactly five columns: `key`, `name`, `stripe_price_id`,
  `client_limit`, `sort`. There is no storage column.
- No quota, metering or enforcement logic exists anywhere in the platform
  source. `files.size_bytes` is recorded per file, but nothing aggregates or
  caps it.
- `stripe_price_id` is `null` for all three tiers. Per the plan action:
  "The price id is null for every tier until a real Stripe account exists."
- The 2026-08-13 pricing migration states that `client_limit` is "the ONLY
  plan-differentiated predicate in the schema" and the three tiers are
  "functionally identical".

## Work required

**Platform**

1. Add `storage_limit_bytes bigint` to `public.plans` (null = unlimited, the
   same convention `client_limit` already uses). Seed: 100 GB, 500 GB, 2 TB.
2. Add per-workspace purchased add-on blocks, so the effective limit is
   `plan allowance + purchased blocks`. A count of 100 GB blocks on the
   subscription is enough; do not model it as a second plan.
3. Roll up usage from `files.size_bytes` per workspace. Prefer a maintained
   counter over a `sum()` on every request.
4. Surface usage in the app and notify at 80% and 100%.
5. Do **not** add an INSERT-blocking policy for storage. That would turn the
   soft cap into a hard cap and contradict what the site now publishes.
   `app.can_add_client` remains the model for hard quotas; storage is not one.

**Stripe**

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
