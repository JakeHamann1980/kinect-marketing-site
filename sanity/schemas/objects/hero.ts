import { defineField, defineType } from "sanity";

/**
 * Shared hero shape used by both `HomeContent.hero` and
 * `PersonaPageContent.hero` in src/content/types.ts:
 * { headline, gradientPhrase, subhead, primaryCta, secondaryCta }.
 */
export default defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "gradientPhrase",
      title: "Gradient Phrase",
      description: "The portion of the headline rendered with the gradient/accent treatment.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "string", validation: (r) => r.required() }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "string", validation: (r) => r.required() }),
  ],
});
