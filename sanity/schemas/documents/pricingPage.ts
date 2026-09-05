import { defineField, defineType } from "sanity";

/**
 * Mirrors `PricingPageContent` in src/content/types.ts (user-directed
 * 2026-08-03: the dedicated /pricing page). Singleton document, id
 * "pricingPage", pinned in sanity/structure.ts like homePage/siteSettings.
 *
 * Note the page's TIER CARDS are NOT here: they render from the shared
 * `siteSettings.pricing` object (same table the home/persona pricing
 * sections use), so editing tiers in Site Settings updates every surface
 * at once. This document carries only what is unique to /pricing: hero,
 * trust chips, the comparison matrix, pricing FAQ, stat band and closing.
 *
 * `comparison.groups[].rows[].values` is a 3-string array aligned to the
 * Site Settings tier order (Starter, Growth, Scale). "yes"/"no" render as
 * check/dash glyphs (see src/components/ComparisonTable.tsx); any other
 * string renders verbatim.
 */
export default defineType({
  name: "pricingPage",
  title: "Pricing Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({
          name: "gradientPhrase",
          description: "Exact trailing substring of the title rendered in the brand gradient.",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({ name: "intro", type: "text", rows: 3, validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "trustLine",
      title: "Trust Chips",
      description: "Short reassurance chips rendered under the tier cards.",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "comparison",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({
          name: "groups",
          type: "array",
          of: [
            {
              type: "object",
              name: "comparisonGroup",
              fields: [
                defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
                defineField({
                  name: "rows",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      name: "comparisonRow",
                      fields: [
                        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
                        defineField({
                          name: "values",
                          description:
                            'Exactly four values in tier order (Kinect, Kinect Plus, Kinect Pro, Kinect Enterprise). "yes" renders a check, "no" renders a dash, anything else renders as text.',
                          type: "array",
                          of: [{ type: "string" }],
                          validation: (r) => r.required().length(4),
                        }),
                      ],
                      preview: {
                        select: { title: "label" },
                      },
                    },
                  ],
                  validation: (r) => r.required().min(1),
                }),
              ],
              preview: {
                select: { title: "heading" },
              },
            },
          ],
          validation: (r) => r.required().min(1),
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({ name: "faqTitle", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "faq",
      type: "array",
      of: [{ type: "faq" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "stat",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "value", type: "string", validation: (r) => r.required() }),
        defineField({ name: "caption", type: "text", rows: 2, validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "closing",
      type: "object",
      fields: [
        defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
        defineField({
          name: "gradientPhrase",
          description: "Exact trailing substring of the headline rendered in the brand gradient.",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({ name: "cta", type: "string", validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({ name: "seo", type: "seo", validation: (r) => r.required() }),
  ],
  preview: {
    prepare: () => ({ title: "Pricing Page" }),
  },
});
