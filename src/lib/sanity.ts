import { createClient, type SanityClient } from "next-sanity";

import { home } from "@/content/home";
import { settings } from "@/content/settings";
import { agency } from "@/content/agency";
import { coach } from "@/content/coach";
import { consultant } from "@/content/consultant";
import { privacy } from "@/content/legal/privacy";
import { terms } from "@/content/legal/terms";
import { security } from "@/content/legal/security";
import { cookies } from "@/content/legal/cookies";
import type { HomeContent, PersonaPageContent, SiteSettings } from "@/content/types";
import type { LegalPage } from "@/content/legal/types";
import type { Persona } from "@/lib/personas";

/**
 * Task 18 (Seed Script + Page Wiring + Revalidation).
 *
 * Design decisions made by the controller, implemented here:
 *
 * - Dataset visibility is PUBLIC (flipped via `sanity datasets visibility
 *   set production public`, see docs/LAUNCH.md item 3). The content is
 *   public marketing copy, so public read means every fetch below is a
 *   plain, unauthenticated, CDN-cacheable GROQ query -- no
 *   `SANITY_API_READ_TOKEN` needed in any environment, dev or prod.
 * - Graceful fallback: every fetcher below TRIES Sanity first and falls
 *   back to the matching local content module (src/content/*) on ANY
 *   failure -- missing env vars, network error, empty dataset, malformed
 *   projection result -- logging a loud `console.warn` each time. The
 *   local modules remain both the seed source (scripts/seed-sanity.ts) and
 *   the type contract (every fetcher's return type is the exact existing
 *   `HomeContent`/`PersonaPageContent`/`SiteSettings`/`LegalPage` type the
 *   components already render from), so Sanity's availability is
 *   non-fatal: dev, e2e and production builds all keep working offline or
 *   before the project/dataset env vars are configured.
 *
 * `client` is `null` (rather than throwing at import time) when the env
 * vars are absent, so every fetcher's fallback path is reachable even in
 * environments that never set `NEXT_PUBLIC_SANITY_PROJECT_ID`/`_DATASET` at
 * all (e.g. this repo's own vitest/unit-test environment).
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

const client: SanityClient | null =
  projectId && dataset
    ? createClient({
        projectId,
        dataset,
        // Pinned, not "latest" -- see sanity/schemas' own Task 17 comments;
        // a fixed API version keeps this fetch surface stable independent
        // of whichever Sanity API version is current when this deploys.
        apiVersion: "2026-07-25",
        // Public dataset (see above) + CDN reads: fast, cacheable, no token.
        useCdn: true,
        perspective: "published",
      })
    : null;

/** Every fetch below is tagged "content" so `revalidateTag("content")` (see
 * src/app/api/revalidate/route.ts) invalidates all of them at once on the
 * Sanity webhook's create/update/delete events -- there is no per-document
 * granularity the site currently needs. */
const FETCH_OPTIONS = { next: { tags: ["content"] } };

const LOCAL_PERSONA: Record<Persona, PersonaPageContent> = { agency, coach, consultant };
const LOCAL_LEGAL: Record<string, LegalPage> = { privacy, terms, security, cookies };

function warnFallback(reason: unknown) {
  console.warn("[sanity] falling back to local content:", reason);
}

const CARD_PROJECTION = `{title, body, features}`;
const STEP_PROJECTION = `{number, title, body}`;
const FAQ_PROJECTION = `{question, answer}`;

/**
 * Reshapes the shared `screenshot` object (a Sanity `image` asset + alt [+
 * caption]) back into the plain `{ src, alt[, caption] }` shape every
 * component already consumes, so ShowcaseCycler/PersonaPage/PillarCards
 * needed zero changes to their prop *shape* -- only to where that shape
 * comes from. `image.asset->url` is the dereferenced CDN URL
 * (cdn.sanity.io); `?auto=format` asks Sanity's image pipeline to serve the
 * best format the requester's `Accept` header supports (matches Sanity's
 * own documented image-URL best practice, see `sanity/schemas/objects/
 * screenshot.ts`) before Next's own image optimizer applies its further
 * width/format transform on top. No fixed `w`/`fit` params are appended:
 * Next's default loader already requests its own set of widths for the
 * `sizes` each component declares, and a fixed width here would just fight
 * that. `alt`/`caption` pass through unprojected -- string fields at the
 * same key name.
 */
const SCREENSHOT_SRC = `image.asset->url + "?auto=format"`;
const SCREENSHOT_PROJECTION = `{"src": ${SCREENSHOT_SRC}, alt}`;

/**
 * Reshapes the `homePage` document back into the exact `HomeContent` shape
 * (see src/content/types.ts) -- explicit field lists rather than `...` so
 * Sanity system fields (`_id`, `_type`, `_rev`, `_createdAt`, `_updatedAt`)
 * and the `_type`/`_key` stamped onto array items by the seed script never
 * leak into what the (already-shipped, Sanity-agnostic) page components
 * consume. The components are the contract; this projection targets them,
 * not the other way around.
 */
const HOME_PROJECTION = `{
  seo, hero, logoStrip, personaSelector,
  "personaCards": personaCards[]{title, body, features, persona, cta},
  stepsSection,
  "steps": steps[]${STEP_PROJECTION},
  showcase{
    title, subhead, labels,
    "workflow": workflow[]${CARD_PROJECTION},
    screenshots{
      "agency": agency${SCREENSHOT_PROJECTION},
      "coach": coach${SCREENSHOT_PROJECTION},
      "consultant": consultant${SCREENSHOT_PROJECTION}
    }
  },
  pillarsSection,
  "pillars": pillars[]${CARD_PROJECTION},
  bento{
    workVisible{
      title, body, features,
      "image": image${SCREENSHOT_PROJECTION}
    },
    aiInsight, stat
  },
  faqTitle,
  "faq": faq[]${FAQ_PROJECTION},
  closing
}`;

export async function fetchHome(): Promise<HomeContent> {
  if (!client) {
    warnFallback("no Sanity client configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID/_DATASET)");
    return home;
  }
  try {
    const doc = await client.fetch<HomeContent | null>(
      `*[_id == "homePage"][0]${HOME_PROJECTION}`,
      {},
      FETCH_OPTIONS,
    );
    if (!doc) throw new Error('"homePage" document not found in dataset');
    return doc;
  } catch (err) {
    warnFallback(err);
    return home;
  }
}

/** Reshapes a `personaPage` document back into `PersonaPageContent`. */
const PERSONA_PROJECTION = `{
  persona, seo, hero, heroExtra, navBadge,
  pain{title, "cards": cards[]${CARD_PROJECTION}},
  capabilities{title, intro, "cards": cards[]${CARD_PROJECTION}},
  screenshot{"src": ${SCREENSHOT_SRC}, alt, caption},
  workflow,
  steps{title, "items": items[]${STEP_PROJECTION}},
  "faq": faq[]${FAQ_PROJECTION},
  closing
}`;

export async function fetchPersona(persona: Persona): Promise<PersonaPageContent> {
  const localFallback = LOCAL_PERSONA[persona];
  if (!client) {
    warnFallback("no Sanity client configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID/_DATASET)");
    return localFallback;
  }
  try {
    const doc = await client.fetch<PersonaPageContent | null>(
      `*[_id == $id][0]${PERSONA_PROJECTION}`,
      { id: `personaPage-${persona}` },
      FETCH_OPTIONS,
    );
    if (!doc) throw new Error(`"personaPage-${persona}" document not found in dataset`);
    return doc;
  } catch (err) {
    warnFallback(err);
    return localFallback;
  }
}

/** Reshapes the `siteSettings` document back into `SiteSettings`. */
const SETTINGS_PROJECTION = `{
  "navLinks": navLinks[]{label, href},
  "solutions": solutions[]{persona, name, description},
  pricing{
    headline, supporting,
    "tiers": tiers[]{name, price, popular, features, cta},
    note
  },
  footer{
    positioning,
    "columns": columns[]{heading, "links": links[]{label, href}},
    "legalLinks": legalLinks[]{label, href},
    copyright
  }
}`;

export async function fetchSettings(): Promise<SiteSettings> {
  if (!client) {
    warnFallback("no Sanity client configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID/_DATASET)");
    return settings;
  }
  try {
    const doc = await client.fetch<SiteSettings | null>(
      `*[_id == "siteSettings"][0]${SETTINGS_PROJECTION}`,
      {},
      FETCH_OPTIONS,
    );
    if (!doc) throw new Error('"siteSettings" document not found in dataset');
    return doc;
  } catch (err) {
    warnFallback(err);
    return settings;
  }
}

/** Reshapes a `legalPage` document back into `LegalPage`. */
const LEGAL_PROJECTION = `{
  slug, title, updated,
  "sections": sections[]{heading, paragraphs},
  seo
}`;

/**
 * Returns `null` for a slug that isn't one of the four known legal pages
 * (matching `/legal/[slug]`'s existing `notFound()` behavior) without ever
 * touching Sanity. For a known slug, tries Sanity and falls back to that
 * slug's local module on any failure -- same contract as the other
 * fetchers above.
 */
export async function fetchLegal(slug: string): Promise<LegalPage | null> {
  const localFallback = LOCAL_LEGAL[slug];
  if (!localFallback) return null;
  if (!client) {
    warnFallback("no Sanity client configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID/_DATASET)");
    return localFallback;
  }
  try {
    const doc = await client.fetch<LegalPage | null>(
      `*[_id == $id][0]${LEGAL_PROJECTION}`,
      { id: `legalPage-${slug}` },
      FETCH_OPTIONS,
    );
    if (!doc) throw new Error(`"legalPage-${slug}" document not found in dataset`);
    return doc;
  } catch (err) {
    warnFallback(err);
    return localFallback;
  }
}
