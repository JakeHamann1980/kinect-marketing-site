/**
 * Targeted reseed of ONE legal document, run as
 * `npx sanity exec scripts/seed-one-legal.ts --with-user-token -- <slug>`.
 *
 * Exists because scripts/seed-sanity.ts createOrReplace's all twelve
 * documents, which is right for a full content deploy and wrong when another
 * session has just shipped a document (platformPage, 2026-08-30) that may
 * have been edited in the Studio since it was seeded. A full reseed would
 * overwrite those edits with whatever is in the repo, silently.
 */
import { getCliClient } from "sanity/cli";
import { privacy } from "../src/content/legal/privacy";
import { terms } from "../src/content/legal/terms";
import { security } from "../src/content/legal/security";
import { cookies } from "../src/content/legal/cookies";
import type { LegalPage } from "../src/content/legal/types";

const client = getCliClient({ apiVersion: "2026-07-25" });
const PAGES: Record<string, LegalPage> = { privacy, terms, security, cookies };

const slug = process.argv[process.argv.length - 1];
const page = PAGES[slug];
if (!page) {
  console.error(`[seed-one-legal] unknown slug "${slug}"`);
  process.exit(1);
}

const doc = {
  _id: `legalPage-${page.slug}`,
  _type: "legalPage",
  slug: page.slug,
  title: page.title,
  updated: page.updated,
  sections: page.sections.map((s, i) => ({
    _key: `k${i}`,
    _type: "legalSection",
    ...s,
  })),
  seo: page.seo,
};

client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .createOrReplace(doc as any)
  .then(() => console.log(`[seed-one-legal] seeded legalPage-${page.slug}`))
  .catch((err) => {
    console.error("[seed-one-legal] failed:", err);
    process.exit(1);
  });
