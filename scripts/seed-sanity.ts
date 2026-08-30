/**
 * Task 18 (Seed Script + Page Wiring + Revalidation). Maps the local content
 * modules -- which remain the seed source AND the type contract, per the
 * controller's graceful-fallback design decision (see src/lib/sanity.ts's
 * own top comment) -- onto Sanity documents with stable ids, via
 * `createOrReplace` (so reseeding is idempotent: rerunning this script
 * overwrites the same documents rather than duplicating them).
 *
 * Run via `npm run seed:sanity`, which is
 * `sanity exec scripts/seed-sanity.ts --with-user-token`: `--with-user-token`
 * has the CLI attach the current `sanity login` session's auth token to the
 * client `getCliClient()` returns below, so there is no separate token to
 * manage or leak -- the design decision the controller made for this task.
 * `getCliClient` (from `sanity/cli`, only resolvable inside a `sanity exec`
 * context) also reads projectId/dataset from sanity.cli.ts, so this script
 * needs no env vars of its own.
 *
 * Field mapping mirrors the Task 17 schemas (sanity/schemas/*) exactly --
 * every content module field lines up 1:1 with its schema field (both were
 * written to mirror `src/content/types.ts` / `src/content/legal/types.ts`),
 * so the only real work here is:
 *   1. attaching `_id`/`_type` to each document, and
 *   2. stamping `_type` + `_key` onto every array-of-object field, matching
 *      the `of: [{ type: "..." }]` the schema declares for that array, so
 *      the Studio can render/reorder/edit each item after seeding (the
 *      write API itself doesn't require this, but omitting it leaves items
 *      the Studio can't recognize until a manual re-save backfills keys).
 *      Arrays of primitives (`features: string[]`, `proofPoints`, `items`
 *      chip lists, legal `paragraphs`) are left as plain arrays -- Sanity
 *      has no `_key`/`_type` concept for scalar array members.
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { getCliClient } from "sanity/cli";

import { home } from "../src/content/home";
import { settings } from "../src/content/settings";
import { agency } from "../src/content/agency";
import { coach } from "../src/content/coach";
import { services } from "../src/content/services";
import { consultant } from "../src/content/consultant";
import { privacy } from "../src/content/legal/privacy";
import { terms } from "../src/content/legal/terms";
import { security } from "../src/content/legal/security";
import { cookies } from "../src/content/legal/cookies";
import { pricingPage } from "../src/content/pricing-page";
import { platformPage } from "../src/content/platform-page";
import type { Card, PersonaPageContent, PlatformSection } from "../src/content/types";
import type { LegalPage } from "../src/content/legal/types";

const client = getCliClient({ apiVersion: "2026-07-25" });

/** Stamps `_type` + `_key` onto each item of an array-of-objects field. */
function arr<T extends object>(type: string, items: T[]) {
  return items.map((item, i) => ({ _key: `k${i}`, _type: type, ...item }));
}

/**
 * Screenshots as Sanity image fields (2026-07-25). Uploads each of the four
 * repo-static PNGs (public/screenshots/*.png) as a Sanity image ASSET,
 * idempotently: rerunning this script (e.g. every reseed) must not pile up
 * a fresh duplicate asset per run. The deterministic approach used here is
 * "query first, upload only on a miss" -- look up an existing
 * `sanity.imageAsset` by its `originalFilename` (the name Sanity's asset
 * pipeline stamps from the uploaded filename, stable across runs since the
 * filename itself never changes) and reuse its `_id` if found; only
 * `client.assets.upload` when no such asset exists yet. This is simpler
 * than computing/storing a content hash out-of-band and is exact here
 * because each of the four filenames is unique and 1:1 with one logical
 * screenshot -- a real content-hash comparison would only matter if the
 * same filename could legitimately point at different bytes over time,
 * which isn't the case for these build assets.
 */
async function uploadImageIdempotent(relPath: string): Promise<string> {
  const filename = basename(relPath);
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename },
  );
  if (existing) {
    console.log(`[seed-sanity] reusing existing asset for ${filename} (${existing._id})`);
    return existing._id;
  }
  const filePath = join(process.cwd(), "public", relPath);
  const asset = await client.assets.upload("image", createReadStream(filePath), { filename });
  console.log(`[seed-sanity] uploaded new asset for ${filename} (${asset._id})`);
  return asset._id;
}

/** Builds a `screenshot` object field value from an already-uploaded asset id. */
function screenshotField(assetId: string, alt: string, caption?: string) {
  return {
    _type: "screenshot",
    image: { _type: "image", asset: { _type: "reference", _ref: assetId } },
    alt,
    ...(caption ? { caption } : {}),
  };
}

async function buildHomeDoc() {
  // The four screenshots this site uses, deduped by underlying asset:
  // agency's persona-page shot and the home cycler's agency slot are the
  // SAME analytics-full.png (see ShowcaseCycler.tsx/agency.ts's own
  // "matches the home cycler" comments), so it is uploaded once here and
  // its id reused both places -- one asset, multiple document references.
  const [analyticsFullId, coachCheckinId, consultantHqId, portalBoardId, servicesHqId] =
    await Promise.all([
    uploadImageIdempotent("/screenshots/analytics-full.png"),
    uploadImageIdempotent("/screenshots/coach-checkin.png"),
    uploadImageIdempotent("/screenshots/consultant-hq.png"),
    uploadImageIdempotent("/screenshots/portal-board.png"),
    uploadImageIdempotent("/screenshots/services-firm-hq.png"),
  ]);

  const homeDoc = {
    _id: "homePage",
    _type: "homePage",
    seo: home.seo,
    hero: home.hero,
    logoStrip: home.logoStrip,
    personaSelector: home.personaSelector,
    personaCards: arr("personaCard", home.personaCards),
    stepsSection: home.stepsSection,
    steps: arr("step", home.steps),
    showcase: {
      title: home.showcase.title,
      subhead: home.showcase.subhead,
      labels: home.showcase.labels,
      workflow: arr<Card>("card", home.showcase.workflow),
      screenshots: {
        agency: screenshotField(analyticsFullId, home.showcase.screenshots.agency.alt),
        services: screenshotField(servicesHqId, home.showcase.screenshots.services.alt),
        consultant: screenshotField(consultantHqId, home.showcase.screenshots.consultant.alt),
      },
    },
    pillarsSection: home.pillarsSection,
    pillars: arr<Card>("card", home.pillars),
    bento: {
      workVisible: {
        title: home.bento.workVisible.title,
        body: home.bento.workVisible.body,
        features: home.bento.workVisible.features,
        image: screenshotField(portalBoardId, home.bento.workVisible.image.alt),
      },
      aiInsight: home.bento.aiInsight,
      stat: home.bento.stat,
    },
    faqTitle: home.faqTitle,
    faq: arr("faq", home.faq),
    closing: home.closing,
  };

  return {
    homeDoc,
    analyticsFullId,
    coachCheckinId,
    consultantHqId,
    portalBoardId,
    servicesHqId,
  };
}

function personaDoc(
  id: string,
  content: PersonaPageContent,
  screenshotAssetId: string,
) {
  return {
    _id: id,
    _type: "personaPage",
    persona: content.persona,
    seo: content.seo,
    hero: content.hero,
    heroExtra: content.heroExtra,
    navBadge: content.navBadge,
    pain: { title: content.pain.title, cards: arr<Card>("card", content.pain.cards) },
    capabilities: {
      title: content.capabilities.title,
      intro: content.capabilities.intro,
      cards: arr<Card>("card", content.capabilities.cards),
    },
    screenshot: screenshotField(screenshotAssetId, content.screenshot.alt, content.screenshot.caption),
    workflow: content.workflow,
    steps: { title: content.steps.title, items: arr("step", content.steps.items) },
    faq: arr("faq", content.faq),
    closing: content.closing,
  };
}

const settingsDoc = {
  _id: "siteSettings",
  _type: "siteSettings",
  navLinks: arr("navLink", settings.navLinks),
  demoUrl: settings.demoUrl,
  solutions: arr("solutionsEntry", settings.solutions),
  pricing: {
    headline: settings.pricing.headline,
    supporting: settings.pricing.supporting,
    tiers: arr("tier", settings.pricing.tiers),
    note: settings.pricing.note,
  },
  footer: {
    positioning: settings.footer.positioning,
    columns: arr(
      "footerColumn",
      // Spread the column so fields added to the type later (e.g. `draft`,
      // 2026-08-03) reach Sanity automatically. Listing fields explicitly
      // silently dropped `draft` on the first pass, which left the hidden
      // "Platform" column still rendering on the live site -- the footer
      // reads from Sanity, so a field the seed omits simply does not exist
      // there. Only `links` needs overriding, to stamp array _key/_type.
      settings.footer.columns.map((column) => ({
        ...column,
        links: arr("footerLink", column.links),
      })),
    ),
    legalLinks: arr("legalLink", settings.footer.legalLinks),
    copyright: settings.footer.copyright,
  },
};


const pricingPageDoc = {
  _id: "pricingPage",
  _type: "pricingPage",
  hero: pricingPage.hero,
  trustLine: pricingPage.trustLine,
  comparison: {
    title: pricingPage.comparison.title,
    intro: pricingPage.comparison.intro,
    groups: arr(
      "comparisonGroup",
      pricingPage.comparison.groups.map((group) => ({
        heading: group.heading,
        rows: arr("comparisonRow", group.rows),
      })),
    ),
  },
  faqTitle: pricingPage.faqTitle,
  faq: arr("faq", pricingPage.faq),
  stat: pricingPage.stat,
  closing: pricingPage.closing,
  seo: pricingPage.seo,
};

/**
 * The /platform overview (promoted out of draft 2026-08-30). Its sections'
 * optional screenshots reference the SAME four assets buildHomeDoc already
 * uploads (the platform page deliberately reuses the persona/home captures,
 * see src/content/platform-page.ts), so this takes a filename -> asset-id
 * map instead of uploading anything itself. The `aspect` field on local
 * screenshot content is NOT seeded: the projection derives it from the
 * asset's own metadata (src/lib/sanity.ts), so seeding it would only create
 * a second source of truth to drift.
 */
function platformPageDoc(assetIdByFilename: Record<string, string>) {
  return {
    _id: "platformPage",
    _type: "platformPage",
    hero: platformPage.hero,
    trustChips: platformPage.trustChips,
    stat: platformPage.stat,
    aiQuote: platformPage.aiQuote,
    sections: arr(
      "platformSection",
      platformPage.sections.map((section: PlatformSection) => {
        const { screenshot, ...rest } = section;
        if (!screenshot) return rest;
        const assetId = assetIdByFilename[basename(screenshot.src)];
        if (!assetId) {
          throw new Error(
            `[seed-sanity] platform section "${section.id}" references ${screenshot.src}, which buildHomeDoc did not upload`,
          );
        }
        return {
          ...rest,
          screenshot: screenshotField(assetId, screenshot.alt, screenshot.caption),
        };
      }),
    ),
    closing: platformPage.closing,
    seo: platformPage.seo,
  };
}

function legalDoc(id: string, content: LegalPage) {
  return {
    _id: id,
    _type: "legalPage",
    slug: content.slug,
    title: content.title,
    updated: content.updated,
    sections: arr("legalSection", content.sections),
    seo: content.seo,
  };
}

async function run() {
  // Screenshot assets are uploaded/resolved once up front (idempotently --
  // see uploadImageIdempotent's doc comment) and their ids reused across
  // whichever documents reference them, rather than re-uploaded per
  // document.
  const {
    homeDoc,
    analyticsFullId,
    coachCheckinId,
    consultantHqId,
    portalBoardId,
    servicesHqId,
  } = await buildHomeDoc();

  const documents = [
    homeDoc,
    settingsDoc,
    pricingPageDoc,
    platformPageDoc({
      "analytics-full.png": analyticsFullId,
      "consultant-hq.png": consultantHqId,
      "portal-board.png": portalBoardId,
      "services-firm-hq.png": servicesHqId,
    }),
    personaDoc("personaPage-agency", agency, analyticsFullId),
    // personaPage-coach is still seeded. The lane is retired from marketing
    // but coach.kinectnow.com still serves it, and `createOrReplace` never
    // prunes, so dropping this line would leave a stale document rather than
    // remove one -- and the page would fall back to the local module with a
    // console warning. Keep seeding it until the host is genuinely retired.
    personaDoc("personaPage-coach", coach, coachCheckinId),
    personaDoc("personaPage-services", services, servicesHqId),
    personaDoc("personaPage-consultant", consultant, consultantHqId),
    legalDoc("legalPage-privacy", privacy),
    legalDoc("legalPage-terms", terms),
    legalDoc("legalPage-security", security),
    legalDoc("legalPage-cookies", cookies),
  ];

  const tx = client.transaction();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const doc of documents) tx.createOrReplace(doc as any);
  await tx.commit();
  console.log(`[seed-sanity] seeded ${documents.length} documents:`);
  for (const doc of documents) console.log(`  - ${doc._id}`);
}

run().catch((err) => {
  console.error("[seed-sanity] failed:", err);
  process.exit(1);
});
