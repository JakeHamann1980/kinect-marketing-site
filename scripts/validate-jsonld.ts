import { spawn, type ChildProcessByStdio } from "node:child_process";
import http from "node:http";
import type { Readable } from "node:stream";

/**
 * Task 20 (JSON-LD Structured Data). Build-independent validation: this
 * script does not import anything from `src/lib/jsonld.ts` or run the unit
 * tests again -- it starts the actual production build (`next start`) on a
 * throwaway port, fetches real rendered HTML for every hostname the site
 * serves, and re-derives its expectations from scratch. That is the point:
 * jsonld.test.ts proves the *builders* are correct in isolation; this
 * script proves the *shipped HTML* actually contains what a crawler (or
 * Google's Rich Results Test) would see, wired through layout.tsx/page.tsx/
 * PersonaPage.tsx exactly as deployed.
 *
 * Spec §8b: "All JSON-LD is validated with Google's Rich Results Test in
 * CI." Google's tool has no headless/CI-friendly API available in this
 * environment (it's an interactive web tool), so this script is the
 * automatable subset of that requirement: well-formed JSON, the right
 * `@type`s in the right places, and the specific numbers spec §8a promotes
 * (lowPrice 149 / highPrice 799 / offerCount 3). The actual Rich Results
 * Test pass is called out as a manual pre-launch step (see docs/LAUNCH.md,
 * Task 23) -- this script cannot and does not substitute for it.
 *
 * Usage: `npm run validate:jsonld` (assumes `npm run build` has already
 * produced a `.next` directory -- see the `build:check` script in
 * package.json, which always runs `next build` first).
 */

const PORT = 4319; // script-chosen; avoid the dev server's default 3000.
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ORG_ID = "https://kinectnow.com/#org";

interface PageTarget {
  label: string;
  host: string;
  path: string;
  /** Whether this page is expected to carry a FAQPage block. */
  expectFaq: boolean;
}

const TARGETS: PageTarget[] = [
  { label: "home (kinectnow.com/)", host: "kinectnow.com", path: "/", expectFaq: true },
  { label: "agency (agency.kinectnow.com/)", host: "agency.kinectnow.com", path: "/", expectFaq: true },
  { label: "coach (coach.kinectnow.com/)", host: "coach.kinectnow.com", path: "/", expectFaq: true },
  { label: "consultant (consultant.kinectnow.com/)", host: "consultant.kinectnow.com", path: "/", expectFaq: true },
  { label: "legal (kinectnow.com/legal/privacy)", host: "kinectnow.com", path: "/legal/privacy", expectFaq: false },
];

/** Fetches a path from the local server with a spoofed Host header, so one
 * running `next start` process can be exercised as every production
 * hostname (the proxy/middleware reads the Host header, not the actual
 * socket target) -- exactly how src/proxy.ts's persona rewrite works in
 * production, just against 127.0.0.1 instead of real DNS. */
function get(target: { host: string; path: string }): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path: target.path,
        method: "GET",
        headers: { Host: target.host },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function waitForServer(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const { status } = await get({ host: "kinectnow.com", path: "/" });
      if (status > 0) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(
    `Server did not become ready on ${ORIGIN} within ${timeoutMs}ms. Last error: ${String(lastError)}`,
  );
}

/** Extracts and JSON.parses every `<script type="application/ld+json">`
 * block on a page. Throws with a page-labeled, snippet-including message on
 * malformed JSON -- the "broken-schema guard" spec §8a calls out ("one
 * competitor ships a broken schema block today"). */
function extractJsonLd(label: string, html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const raw = match[1];
    try {
      blocks.push(JSON.parse(raw));
    } catch (err) {
      throw new Error(
        `[${label}] malformed JSON-LD block (JSON.parse failed: ${String(err)}).\n` +
          `Snippet: ${raw.slice(0, 200)}${raw.length > 200 ? "..." : ""}`,
      );
    }
  }
  return blocks;
}

function isType(block: unknown, type: string): block is Record<string, unknown> {
  return (
    typeof block === "object" &&
    block !== null &&
    (block as Record<string, unknown>)["@type"] === type
  );
}

async function checkPage(target: PageTarget, failures: string[]): Promise<void> {
  const { status, body } = await get(target);
  if (status !== 200) {
    failures.push(`[${target.label}] expected HTTP 200, got ${status}`);
    return;
  }

  let blocks: unknown[];
  try {
    blocks = extractJsonLd(target.label, body);
  } catch (err) {
    failures.push(String(err instanceof Error ? err.message : err));
    return;
  }

  if (blocks.length === 0) {
    failures.push(`[${target.label}] found no ld+json blocks at all`);
    return;
  }

  // Every block must carry @context.
  for (const block of blocks) {
    const ctx = (block as Record<string, unknown> | null)?.["@context"];
    if (ctx !== "https://schema.org") {
      failures.push(`[${target.label}] a block is missing "@context": "https://schema.org" (got ${JSON.stringify(ctx)})`);
    }
  }

  // Exactly one Organization, with the canonical shared @id.
  const orgs = blocks.filter((b) => isType(b, "Organization"));
  if (orgs.length !== 1) {
    failures.push(`[${target.label}] expected exactly 1 Organization block, found ${orgs.length}`);
  } else if (orgs[0]["@id"] !== ORG_ID) {
    failures.push(`[${target.label}] Organization @id mismatch: expected "${ORG_ID}", got ${JSON.stringify(orgs[0]["@id"])}`);
  }

  // SoftwareApplication + AggregateOffer 149/799/3, present site-wide.
  const apps = blocks.filter((b) => isType(b, "SoftwareApplication"));
  if (apps.length !== 1) {
    failures.push(`[${target.label}] expected exactly 1 SoftwareApplication block, found ${apps.length}`);
  } else {
    const offers = apps[0].offers as Record<string, unknown> | undefined;
    if (!offers || offers["@type"] !== "AggregateOffer") {
      failures.push(`[${target.label}] SoftwareApplication.offers is not an AggregateOffer`);
    } else {
      const expected = { lowPrice: "149", highPrice: "799", offerCount: "3", priceCurrency: "USD" };
      for (const [key, value] of Object.entries(expected)) {
        if (offers[key] !== value) {
          failures.push(`[${target.label}] AggregateOffer.${key} expected ${JSON.stringify(value)}, got ${JSON.stringify(offers[key])}`);
        }
      }
    }
  }

  // FAQPage: present with >=5 questions on home/persona pages, absent on legal.
  const faqPages = blocks.filter((b) => isType(b, "FAQPage"));
  if (target.expectFaq) {
    if (faqPages.length !== 1) {
      failures.push(`[${target.label}] expected exactly 1 FAQPage block, found ${faqPages.length}`);
    } else {
      const mainEntity = faqPages[0].mainEntity;
      const count = Array.isArray(mainEntity) ? mainEntity.length : 0;
      if (count < 5) {
        failures.push(`[${target.label}] FAQPage.mainEntity has ${count} questions, expected >= 5`);
      }
    }
  } else if (faqPages.length !== 0) {
    failures.push(`[${target.label}] expected no FAQPage block, found ${faqPages.length}`);
  }
}

async function main() {
  const failures: string[] = [];
  let server: ChildProcessByStdio<null, Readable, Readable> | undefined;
  // Distinguishes an unexpected server crash from our own `server.kill()`
  // below (which also fires the "exit" listener, with a SIGTERM exit code)
  // -- only the former is worth logging as a problem.
  let shuttingDown = false;

  try {
    server = spawn("npx", ["next", "start", "-p", String(PORT)], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let serverOutput = "";
    server.stdout.on("data", (d) => (serverOutput += String(d)));
    server.stderr.on("data", (d) => (serverOutput += String(d)));
    server.on("exit", (code) => {
      if (!shuttingDown && code !== null && code !== 0) {
        console.error(`next start exited unexpectedly with code ${code}:\n${serverOutput}`);
      }
    });

    await waitForServer(30_000);

    for (const target of TARGETS) {
      await checkPage(target, failures);
    }
  } finally {
    shuttingDown = true;
    if (server && !server.killed) {
      server.kill();
    }
  }

  if (failures.length > 0) {
    console.error(`\nvalidate:jsonld FAILED (${failures.length} problem${failures.length === 1 ? "" : "s"}):\n`);
    for (const f of failures) console.error(`  - ${f}`);
    console.error("");
    process.exit(1);
  }

  console.log(`validate:jsonld OK -- checked ${TARGETS.length} pages, all structured-data assertions passed.`);
}

main().catch((err) => {
  console.error("validate:jsonld crashed:", err);
  process.exit(1);
});
