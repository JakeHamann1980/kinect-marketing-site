import { defineField, defineType } from "sanity";

/**
 * Singleton document mirroring `HomeContent` in src/content/types.ts.
 * There is exactly one `homePage` document; the Studio structure (see
 * sanity/structure.ts) pins it to a single non-creatable, non-deletable
 * entry instead of a list.
 */
export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({ name: "seo", type: "seo", validation: (r) => r.required() }),
    defineField({ name: "hero", type: "hero", validation: (r) => r.required() }),
    defineField({
      name: "logoStrip",
      title: "Logo Strip",
      type: "object",
      fields: [defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() })],
    }),
    defineField({
      name: "personaSelector",
      title: "Persona Selector",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2, validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "personaCards",
      title: "Persona Cards",
      type: "array",
      of: [{ type: "personaCard" }],
      validation: (r) => r.required().length(3),
    }),
    defineField({
      name: "stepsSection",
      title: "Steps Section",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [{ type: "step" }],
    }),
    defineField({
      name: "showcase",
      title: "Product Showcase",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({
          name: "labels",
          title: "Labels (per persona)",
          type: "object",
          description: "Screenshot cycler label text shown per persona.",
          fields: [
            defineField({ name: "agency", type: "string", validation: (r) => r.required() }),
            defineField({ name: "coach", type: "string", validation: (r) => r.required() }),
            defineField({ name: "consultant", type: "string", validation: (r) => r.required() }),
          ],
        }),
        defineField({
          name: "screenshots",
          title: "Screenshots (per persona)",
          type: "object",
          description:
            "The three cross-fading product screenshots ShowcaseCycler cycles through, " +
            "one per persona. Each is a real Sanity image upload (see the shared " +
            "`screenshot` object type) so editors can replace them without a deploy.",
          fields: [
            defineField({ name: "agency", type: "screenshot", validation: (r) => r.required() }),
            defineField({ name: "coach", type: "screenshot", validation: (r) => r.required() }),
            defineField({ name: "consultant", type: "screenshot", validation: (r) => r.required() }),
          ],
        }),
        defineField({
          name: "workflow",
          title: "Workflow Callouts",
          type: "array",
          of: [{ type: "card" }],
        }),
      ],
    }),
    defineField({
      name: "pillarsSection",
      title: "Pillars Section",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2, validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "pillars",
      title: "Pillars",
      type: "array",
      of: [{ type: "card" }],
    }),
    defineField({
      name: "bento",
      title: "Bento",
      type: "object",
      fields: [
        defineField({
          name: "workVisible",
          title: "Work Visible",
          type: "object",
          description:
            "Same shape as `card` (title/body/features) plus a required product " +
            "screenshot -- kept as its own inline object rather than reusing the " +
            "shared `card` type so the image field doesn't leak into every other " +
            "card usage (pain/capabilities/pillars/workflow cards have no screenshot).",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required() }),
            defineField({ name: "features", title: "Features", type: "array", of: [{ type: "string" }] }),
            defineField({ name: "image", type: "screenshot", validation: (r) => r.required() }),
          ],
        }),
        defineField({
          name: "aiInsight",
          title: "AI Insight",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
            defineField({ name: "quote", type: "text", rows: 2, validation: (r) => r.required() }),
          ],
        }),
        defineField({
          name: "stat",
          title: "Stat",
          type: "object",
          fields: [
            defineField({ name: "value", type: "string", validation: (r) => r.required() }),
            defineField({ name: "caption", type: "string", validation: (r) => r.required() }),
          ],
        }),
      ],
    }),
    defineField({ name: "faqTitle", title: "FAQ Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "faq", title: "FAQ", type: "array", of: [{ type: "faq" }] }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description:
        "Home's closing CTA has only a headline pair and subhead -- no secondaryCta " +
        "(unlike persona pages), since the 'Not you? Pick another lane' button only " +
        "makes sense on subdomain pages routing back to the home persona picker.",
      fields: [
        defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
        defineField({ name: "gradientPhrase", title: "Gradient Phrase", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
