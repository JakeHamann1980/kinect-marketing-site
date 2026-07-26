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
    expect(org.sameAs).toHaveLength(PERSONA_IDS.length);
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
  it("is a schema.org SoftwareApplication referencing the org @id", () => {
    const app = softwareApplicationLd();
    expect(app["@context"]).toBe("https://schema.org");
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.name).toBe("KINECT");
    expect(app.applicationCategory).toBe("BusinessApplication");
    expect(app.operatingSystem).toBe("Web");
    expect(app.url).toBe(SITE_URL);
    expect(app.publisher).toEqual({ "@id": ORG_ID });
  });

  it("derives AggregateOffer numbers from settings.pricing.tiers, not hardcoded literals", () => {
    const tiers = settings.pricing.tiers;
    const expectedLow = Math.min(...tiers.map((t) => t.price));
    const expectedHigh = Math.max(...tiers.map((t) => t.price));

    const app = softwareApplicationLd();
    const offers = app.offers;

    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers.priceCurrency).toBe("USD");
    // Mutate-resistant: compared against derived settings values, so this
    // test still passes (correctly) if the tier prices ever change, and
    // still fails (correctly) if the builder stops deriving from settings.
    expect(offers.lowPrice).toBe(String(expectedLow));
    expect(offers.highPrice).toBe(String(expectedHigh));
    expect(offers.offerCount).toBe(String(tiers.length));
  });

  it("lists one Offer per settings tier, with matching name/price/currency", () => {
    const tiers = settings.pricing.tiers;
    const app = softwareApplicationLd();
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

  it("still matches the spec's launch numbers today (149/799/3) via settings, not a literal in the builder", () => {
    // Belt-and-suspenders: spec §8a promotes exactly these numbers
    // (lowPrice 149, highPrice 799, offerCount 3). This assertion is
    // expected to track settings.ts, which is the single source of truth --
    // if settings.ts's tiers ever change, this test (not just the
    // settings-derived one above) should be updated deliberately.
    const app = softwareApplicationLd();
    expect(app.offers.lowPrice).toBe("149");
    expect(app.offers.highPrice).toBe("799");
    expect(app.offers.offerCount).toBe("3");
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
    { name: "softwareApplicationLd", build: softwareApplicationLd },
    { name: "faqPageLd", build: () => faqPageLd([{ question: "Q", answer: "A" }]) },
  ];

  it.each(builders)("$name is JSON-serializable and carries @context", ({ build }) => {
    const value = build();
    const roundTripped = JSON.parse(JSON.stringify(value));
    expect(roundTripped["@context"]).toBe("https://schema.org");
    expect(roundTripped).toEqual(value);
  });
});
