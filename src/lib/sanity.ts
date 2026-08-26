import { createClient, type SanityClient } from "next-sanity";

import { home } from "@/content/home";
import { settings } from "@/content/settings";
import { agency } from "@/content/agency";
import { coach } from "@/content/coach";
import { services } from "@/content/services";
import { consultant } from "@/content/consultant";
import { privacy } from "@/content/legal/privacy";
import { terms } from "@/content/legal/terms";
import { security } from "@/content/legal/security";
import { cookies } from "@/content/legal/cookies";
import { pricingPage } from "@/content/pricing-page";
import type {
  HomeContent,
  PersonaPageContent,
  PricingPageContent,
  SiteSettings,
} from "@/content/types";
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

const LOCAL_PERSONA: Record<Persona, PersonaPageContent> = { agency, coach, consultant, services };
const LOCAL_LEGAL: Record<string, LegalPage> = { privacy, terms, security, cookies };

function warnFallback(reason: unknown) {
  console.warn("[sanity] falling back to local content:", reason);
}

/**
 * Post-fetch shape validation (release review fix, 2026-07-26).
 *
 * GROQ silently turns a hollowed-out required field into `null`/`undefined`
 * rather than erroring: an editor deleting/unsetting a required object (e.g.
 * `personaPage.screenshot`, `homePage.bento.workVisible.image`), or any
 * dereference (`->`) whose target asset no longer resolves, makes that
 * field disappear from the result instead of failing the query. Before this
 * fix, `fetchHome`/`fetchPersona`/`fetchSettings`/`fetchLegal` only checked
 * `!doc` (the whole document missing) -- a malformed-but-present document
 * sailed through and reached components that dereference fields with no
 * null-guard (`PersonaPage.tsx`'s `content.screenshot.src`,
 * `ShowcaseCycler`'s `images[persona].src`, `PillarCards`'
 * `bento.workVisible.image.src`, `Footer`'s destructured `settings.footer`,
 * `PricingSection`'s `tiers.map`, the legal template's `page.sections.map`),
 * producing a render-time `TypeError` -> uncaught 500 in production. This
 * file's own top comment already promised fallback on "malformed
 * projection result"; these `assert*Shape` functions make that true by
 * throwing a descriptive error the surrounding `try/catch` turns into the
 * existing `warnFallback` + local-content-module path -- no different from
 * a network error as far as each fetcher's control flow is concerned.
 *
 * Deliberately NOT a full recursive schema validator (i.e. not asserting
 * every string/array leaf in `HomeContent`/`PersonaPageContent`/
 * `SiteSettings`/`LegalPage`): each function asserts every top-level
 * required section is present (a cheap, cheap-to-maintain truthy check per
 * field), plus the specific nested fields identified above whose absence
 * throws before a single pixel renders. Exported so they can be unit-tested
 * directly as pure functions, independent of the module's Sanity client
 * construction (see sanity.test.ts).
 */
function required<T>(value: T, path: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`content shape assertion failed: "${path}" is missing/null`);
  }
}

export function assertHomeShape(doc: HomeContent): void {
  required(doc.seo, "seo");
  required(doc.hero, "hero");
  required(doc.logoStrip, "logoStrip");
  required(doc.personaSelector, "personaSelector");
  required(doc.personaCards, "personaCards");
  required(doc.stepsSection, "stepsSection");
  required(doc.steps, "steps");
  required(doc.showcase, "showcase");
  required(doc.showcase?.workflow, "showcase.workflow");
  required(doc.showcase?.screenshots, "showcase.screenshots");
  required(doc.showcase?.screenshots?.agency?.src, "showcase.screenshots.agency.src");
  required(doc.showcase?.screenshots?.services?.src, "showcase.screenshots.services.src");
  required(doc.showcase?.screenshots?.consultant?.src, "showcase.screenshots.consultant.src");
  required(doc.pillarsSection, "pillarsSection");
  required(doc.pillars, "pillars");
  required(doc.bento, "bento");
  required(doc.bento?.workVisible, "bento.workVisible");
  required(doc.bento?.workVisible?.image?.src, "bento.workVisible.image.src");
  required(doc.bento?.aiInsight, "bento.aiInsight");
  required(doc.bento?.stat, "bento.stat");
  required(doc.faqTitle, "faqTitle");
  required(doc.faq, "faq");
  required(doc.closing, "closing");
}

export function assertPersonaShape(doc: PersonaPageContent): void {
  required(doc.persona, "persona");
  required(doc.seo, "seo");
  required(doc.hero, "hero");
  required(doc.heroExtra, "heroExtra");
  required(doc.navBadge, "navBadge");
  required(doc.pain, "pain");
  required(doc.capabilities, "capabilities");
  required(doc.screenshot, "screenshot");
  required(doc.screenshot?.src, "screenshot.src");
  required(doc.workflow, "workflow");
  required(doc.steps, "steps");
  required(doc.faq, "faq");
  required(doc.closing, "closing");
}

export function assertSettingsShape(doc: SiteSettings): void {
  required(doc.navLinks, "navLinks");
  required(doc.solutions, "solutions");
  required(doc.pricing, "pricing");
  required(doc.pricing?.headline, "pricing.headline");
  required(doc.pricing?.supporting, "pricing.supporting");
  required(doc.pricing?.tiers, "pricing.tiers");
  required(doc.footer, "footer");
  required(doc.footer?.positioning, "footer.positioning");
  required(doc.footer?.columns, "footer.columns");
  required(doc.footer?.legalLinks, "footer.legalLinks");
  required(doc.footer?.copyright, "footer.copyright");
}

export function assertPricingPageShape(doc: PricingPageContent): void {
  required(doc.seo, "seo");
  required(doc.hero, "hero");
  required(doc.hero?.title, "hero.title");
  // Both gradient phrases are load-bearing (renderWithGradient consumes
  // them), so a pre-rework Sanity doc that lacks them must fall back to
  // local content rather than reach the renderer.
  required(doc.hero?.gradientPhrase, "hero.gradientPhrase");
  required(doc.trustLine, "trustLine");
  required(doc.comparison, "comparison");
  required(doc.comparison?.groups, "comparison.groups");
  required(doc.faqTitle, "faqTitle");
  required(doc.faq, "faq");
  required(doc.stat, "stat");
  required(doc.closing, "closing");
  required(doc.closing?.gradientPhrase, "closing.gradientPhrase");
}

export function assertLegalShape(doc: LegalPage): void {
  required(doc.slug, "slug");
  required(doc.title, "title");
  required(doc.updated, "updated");
  required(doc.sections, "sections");
  required(doc.seo, "seo");
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
      "services": services${SCREENSHOT_PROJECTION},
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
    assertHomeShape(doc);
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
    assertPersonaShape(doc);
    return doc;
  } catch (err) {
    warnFallback(err);
    return localFallback;
  }
}

/** Reshapes the `siteSettings` document back into `SiteSettings`. */
const SETTINGS_PROJECTION = `{
  "navLinks": navLinks[]{label, href, draft},
  "solutions": solutions[]{persona, name, description},
  pricing{
    headline, supporting,
    "tiers": tiers[]{name, price, popular, features, tagline, detail, cta},
    note
  },
  footer{
    positioning,
    "columns": columns[]{heading, draft, "links": links[]{label, href, draft}},
    "legalLinks": legalLinks[]{label, href, draft},
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
    assertSettingsShape(doc);
    return doc;
  } catch (err) {
    warnFallback(err);
    return settings;
  }
}

/** Reshapes the `pricingPage` document back into `PricingPageContent`. */
const PRICING_PAGE_PROJECTION = `{
  seo, hero, trustLine,
  comparison{
    title, intro,
    "groups": groups[]{heading, "rows": rows[]{label, values}}
  },
  faqTitle,
  "faq": faq[]${FAQ_PROJECTION},
  stat, closing
}`;

export async function fetchPricingPage(): Promise<PricingPageContent> {
  if (!client) {
    warnFallback("no Sanity client configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID/_DATASET)");
    return pricingPage;
  }
  try {
    const doc = await client.fetch<PricingPageContent | null>(
      `*[_id == "pricingPage"][0]${PRICING_PAGE_PROJECTION}`,
      {},
      FETCH_OPTIONS,
    );
    if (!doc) throw new Error('"pricingPage" document not found in dataset');
    assertPricingPageShape(doc);
    return doc;
  } catch (err) {
    warnFallback(err);
    return pricingPage;
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
    assertLegalShape(doc);
    return doc;
  } catch (err) {
    warnFallback(err);
    return localFallback;
  }
}
