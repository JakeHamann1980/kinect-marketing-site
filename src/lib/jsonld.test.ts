import { describe, it, expect } from "vitest";
import {
  organizationLd,
  websiteLd,
  softwareApplicationLd,
  faqPageLd,
  ORG_ID,
} from "./jsonld";
import { settings } from "@/content/settings";
import { SITE_URL } from "@/lib/seo";
import { PERSONA_IDS } from "@/lib/personas";
import { LIVE_SOCIAL_URLS, SOCIAL_PROFILES } from "@/lib/social";

/**
 * Task 20 (JSON-LD Structured Data). Pure-function builders live in
 * src/lib/jsonld.ts with no React/DOM dependency, so this is a plain
 * "unit" project test (src/**\/*.test.ts, node environment) per
 * vitest.config.ts -- no jsdom needed.
 */

describe("organizationLd", () => {
  it("carries the canonical org @id, identical across calls", () => {
    const first = organizationLd();
    const second = organizationLd();
    expect(first["@id"]).toBe("https://kinectnow.com/#org");
    expect(second["@id"]).toBe(first["@id"]);
    expect(first["@id"]).toBe(ORG_ID);
  });

  it("is a schema.org Organization anchored at SITE_URL", () => {
    const org = organizationLd();
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("KINECT");
    expect(org.url).toBe(SITE_URL);
  });

  it("lists an absolute logo URL", () => {
    const org = organizationLd();
    expect(org.logo).toBe(`${SITE_URL}/icon.svg`);
  });

  it("sameAs includes every persona subdomain root", () => {
    const org = organizationLd();
    for (const persona of PERSONA_IDS) {
      expect(org.sameAs).toContain(`https://${persona}.kinectnow.com/`);
    }
    expect(org.sameAs).toHaveLength(PERSONA_IDS.length + LIVE_SOCIAL_URLS.length);
  });

  it("sameAs carries confirmed profiles and never a draft one", () => {
    const org = organizationLd();
    for (const url of LIVE_SOCIAL_URLS) expect(org.sameAs).toContain(url);
    // The rule, not a hardcoded platform: a sameAs pointing at a profile
    // that does not exist yet undermines the entity disambiguation it is
    // there to provide. (X was the draft when this was written and is now
    // confirmed; Instagram is the current one.)
    for (const profile of SOCIAL_PROFILES.filter((p) => p.draft)) {
      expect(org.sameAs).not.toContain(profile.href);
    }
  });
});

describe("websiteLd", () => {
  it("is a schema.org WebSite referencing the org @id as publisher", () => {
    const site = websiteLd();
    expect(site["@context"]).toBe("https://schema.org");
    expect(site["@type"]).toBe("WebSite");
    expect(site.name).toBe("KINECT");
    expect(site.url).toBe(SITE_URL);
    expect(site.publisher).toEqual({ "@id": ORG_ID });
  });
});

describe("softwareApplicationLd", () => {
  // Fix (final review, I2): softwareApplicationLd now takes `tiers` as a
  // required parameter instead of importing the local `settings` module
  // itself (see jsonld.ts's own doc comment: the real single source of
  // truth is whatever `fetchSettings()` resolves to, which the `(site)`
  // layout fetches and passes in -- the local `settings.pricing.tiers` used
  // here is this test's own stand-in for "whatever tiers the caller
  // passed", same as the real caller's fetched-or-fallback value would be).
  it("is a schema.org SoftwareApplication referencing the org @id", () => {
    const app = softwareApplicationLd(settings.pricing.tiers);
    expect(app["@context"]).toBe("https://schema.org");
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.name).toBe("KINECT");
    expect(app.applicationCategory).toBe("BusinessApplication");
    expect(app.operatingSystem).toBe("Web");
    expect(app.url).toBe(SITE_URL);
    expect(app.publisher).toEqual({ "@id": ORG_ID });
  });

  it("derives AggregateOffer numbers from the passed-in tiers, not hardcoded literals", () => {
    const tiers = settings.pricing.tiers;
    const expectedLow = Math.min(...tiers.map((t) => t.price));
    const expectedHigh = Math.max(...tiers.map((t) => t.price));

    const app = softwareApplicationLd(tiers);
    const offers = app.offers;

    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers.priceCurrency).toBe("USD");
    // Mutate-resistant: compared against derived settings values, so this
    // test still passes (correctly) if the tier prices ever change, and
    // still fails (correctly) if the builder stops deriving from its
    // `tiers` argument.
    expect(offers.lowPrice).toBe(String(expectedLow));
    expect(offers.highPrice).toBe(String(expectedHigh));
    expect(offers.offerCount).toBe(String(tiers.length));
  });

  it("lists one Offer per passed-in tier, with matching name/price/currency", () => {
    const tiers = settings.pricing.tiers;
    const app = softwareApplicationLd(tiers);
    const offerList = app.offers.offers;

    expect(offerList).toHaveLength(tiers.length);
    tiers.forEach((tier, i) => {
      expect(offerList[i]).toMatchObject({
        "@type": "Offer",
        name: tier.name,
        price: String(tier.price),
        priceCurrency: "USD",
      });
    });
  });

  it("still matches the published numbers today (149/1499/4) via settings.pricing.tiers", () => {
    // Belt-and-suspenders against the same numbers
    // scripts/validate-jsonld.ts asserts on the live rendered HTML (see that
    // script's own comment on why it keeps them hardcoded rather than
    // importing settings.ts: it validates the actually-shipped HTML
    // independent of any one content source, Sanity or local). This
    // assertion is expected to track settings.ts's tiers -- if they ever
    // change, this test (not just the settings-derived one above) should be
    // updated deliberately.
    //
    // Was 149/799/3 until Kinect Enterprise landed 2026-09-01. highPrice is
    // now the Enterprise BASE; the $250-per-location rate is deliberately not
    // a tier price, so it never reaches AggregateOffer.
    const app = softwareApplicationLd(settings.pricing.tiers);
    expect(app.offers.lowPrice).toBe("149");
    expect(app.offers.highPrice).toBe("1499");
    expect(app.offers.offerCount).toBe("4");
  });
});

describe("faqPageLd", () => {
  const faqs = [
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
    { question: "Q3", answer: "A3" },
  ];

  it("is a schema.org FAQPage mapping every Faq to a Question/Answer pair", () => {
    const page = faqPageLd(faqs);
    expect(page["@context"]).toBe("https://schema.org");
    expect(page["@type"]).toBe("FAQPage");
    expect(page.mainEntity).toHaveLength(faqs.length);
    page.mainEntity.forEach((entry, i) => {
      expect(entry).toEqual({
        "@type": "Question",
        name: faqs[i].question,
        acceptedAnswer: { "@type": "Answer", text: faqs[i].answer },
      });
    });
  });

  it("maps a different N when given a different-length list", () => {
    const page = faqPageLd(faqs.slice(0, 1));
    expect(page.mainEntity).toHaveLength(1);
  });
});

describe("JSON serialization", () => {
  const builders: { name: string; build: () => object }[] = [
    { name: "organizationLd", build: organizationLd },
    { name: "websiteLd", build: websiteLd },
    { name: "softwareApplicationLd", build: () => softwareApplicationLd(settings.pricing.tiers) },
    { name: "faqPageLd", build: () => faqPageLd([{ question: "Q", answer: "A" }]) },
  ];

  it.each(builders)("$name is JSON-serializable and carries @context", ({ build }) => {
    const value = build();
    const roundTripped = JSON.parse(JSON.stringify(value));
    expect(roundTripped["@context"]).toBe("https://schema.org");
    expect(roundTripped).toEqual(value);
  });
});
