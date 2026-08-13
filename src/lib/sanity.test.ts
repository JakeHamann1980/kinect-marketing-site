import { describe, it, expect } from "vitest";
import {
  assertHomeShape,
  assertPersonaShape,
  assertSettingsShape,
  assertLegalShape,
  assertPricingPageShape,
} from "./sanity";
import { home } from "@/content/home";
import { agency } from "@/content/agency";
import { settings } from "@/content/settings";
import { privacy } from "@/content/legal/privacy";
import { pricingPage } from "@/content/pricing-page";

/**
 * Release-review fix (2026-07-26): a Sanity document whose `screenshot`
 * object (or any other required section) resolved to `null` -- an editor
 * deleting/unsetting it, or a broken `->` dereference -- used to sail past
 * `fetchHome`/`fetchPersona`'s old `!doc` check and crash a component at
 * render time (`content.screenshot.src` etc, all unguarded). These
 * `assert*Shape` functions are what `fetchHome`/`fetchPersona`/
 * `fetchSettings`/`fetchLegal` now call right after the `!doc` check, so
 * that same hollowed-out shape throws instead and the existing
 * `warnFallback` + local-content-module path takes over.
 *
 * Tested here as pure functions directly (see sanity.ts's own doc comment
 * on `required`/`assert*Shape`) rather than by mocking `next-sanity`'s
 * `createClient` and `fetchHome`'s env-gated module-level `client` --
 * that would mean faking a Sanity HTTP response and the module's
 * import-time client construction just to exercise validation logic that
 * has no dependency on either. The local content modules (`home`, `agency`,
 * `settings`, `privacy`) already satisfy `HomeContent`/`PersonaPageContent`/
 * `SiteSettings`/`LegalPage` exactly (they are the seed source AND the type
 * contract -- see sanity.ts's own top comment), so they double as valid
 * fixtures; each test clones one and hollows out a single required field to
 * confirm the assertion (and only that assertion) rejects it.
 */
describe("assertHomeShape", () => {
  it("accepts the real home content unchanged", () => {
    expect(() => assertHomeShape(home)).not.toThrow();
  });

  it("rejects a null showcase.screenshots.agency.src (the reported crash case)", () => {
    const doc = structuredClone(home);
    // @ts-expect-error -- deliberately hollowing out a required field to
    // simulate a Sanity projection result with an unset/undereferenceable
    // screenshot, exactly what the release-review Critical described.
    doc.showcase.screenshots.agency = null;
    expect(() => assertHomeShape(doc)).toThrow(/showcase\.screenshots\.agency\.src/);
  });

  it("rejects a null bento.workVisible.image (the other reported crash case)", () => {
    const doc = structuredClone(home);
    // @ts-expect-error -- see above.
    doc.bento.workVisible.image = null;
    expect(() => assertHomeShape(doc)).toThrow(/bento\.workVisible\.image\.src/);
  });

  it("rejects a null top-level required section (e.g. hero unset entirely)", () => {
    const doc = structuredClone(home);
    // @ts-expect-error -- see above.
    doc.hero = null;
    expect(() => assertHomeShape(doc)).toThrow(/"hero"/);
  });
});

describe("assertPersonaShape", () => {
  it("accepts real persona content unchanged", () => {
    expect(() => assertPersonaShape(agency)).not.toThrow();
  });

  it("rejects a null screenshot object (PersonaPage.tsx's unguarded content.screenshot.src)", () => {
    const doc = structuredClone(agency);
    // @ts-expect-error -- see assertHomeShape's tests above.
    doc.screenshot = null;
    expect(() => assertPersonaShape(doc)).toThrow(/"screenshot"/);
  });

  it("rejects a screenshot object present but missing its src", () => {
    const doc = structuredClone(agency);
    // @ts-expect-error -- simulates the image field resolving but the
    // dereferenced asset URL failing to resolve (src ends up undefined).
    doc.screenshot.src = undefined;
    expect(() => assertPersonaShape(doc)).toThrow(/screenshot\.src/);
  });
});

describe("assertSettingsShape", () => {
  it("accepts real settings content unchanged", () => {
    expect(() => assertSettingsShape(settings)).not.toThrow();
  });

  it("rejects a null footer (Footer.tsx destructures settings.footer directly)", () => {
    const doc = structuredClone(settings);
    // @ts-expect-error -- see above.
    doc.footer = null;
    expect(() => assertSettingsShape(doc)).toThrow(/"footer"/);
  });

  it("rejects a null pricing.tiers (PricingSection maps tiers directly)", () => {
    const doc = structuredClone(settings);
    // @ts-expect-error -- see above.
    doc.pricing.tiers = null;
    expect(() => assertSettingsShape(doc)).toThrow(/pricing\.tiers/);
  });
});

describe("assertLegalShape", () => {
  it("accepts real legal content unchanged", () => {
    expect(() => assertLegalShape(privacy)).not.toThrow();
  });

  it("rejects a null sections array (the legal template maps page.sections directly)", () => {
    const doc = structuredClone(privacy);
    // @ts-expect-error -- see above.
    doc.sections = null;
    expect(() => assertLegalShape(doc)).toThrow(/"sections"/);
  });
});

describe("assertPricingPageShape", () => {
  it("accepts real pricing page content unchanged", () => {
    expect(() => assertPricingPageShape(pricingPage)).not.toThrow();
  });

  it("rejects null comparison groups (ComparisonTable maps groups directly)", () => {
    const doc = structuredClone(pricingPage);
    // @ts-expect-error -- see above.
    doc.comparison.groups = null;
    expect(() => assertPricingPageShape(doc)).toThrow(/comparison\.groups/);
  });

  it("rejects a null faq array (the Faq accordion maps items directly)", () => {
    const doc = structuredClone(pricingPage);
    // @ts-expect-error -- see above.
    doc.faq = null;
    expect(() => assertPricingPageShape(doc)).toThrow(/"faq"/);
  });
});
