import { defineField, defineType } from "sanity";

/**
 * Mirrors `PersonaPageContent` in src/content/types.ts. One document per
 * persona (agency, coach, consultant) -- not a singleton, but `persona` is
 * constrained to the three known values and should be unique per document
 * (enforced editorially; Sanity has no native "max one document per enum
 * value" constraint).
 *
 * `screenshot` uses the shared `screenshot` object (a real Sanity `image`
 * asset + alt + caption) rather than a hand-typed source path. User-directed
 * 2026-07-25: reversed from the original "repo-static build asset" decision
 * (see git history for that prior comment) so editors can upload/replace a
 * persona's product screenshot from the Studio without a deploy. The
 * frontend's `src/lib/sanity.ts` projection dereferences `image.asset->url`
 * back into a plain `src` string, so `PersonaPageContent`'s existing
 * `{ src, alt, caption }` contract (and every component that consumes it)
 * is unchanged.
 */
export default defineType({
  name: "personaPage",
  title: "Persona Page",
  type: "document",
  fields: [
    defineField({
      name: "persona",
      type: "string",
      options: {
        list: [
          { title: "Agency", value: "agency" },
          { title: "Coach", value: "coach" },
          { title: "Consultant", value: "consultant" },
          { title: "Professional Services", value: "services" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "seo", type: "seo", validation: (r) => r.required() }),
    defineField({ name: "hero", type: "hero", validation: (r) => r.required() }),
    defineField({
      name: "heroExtra",
      title: "Hero Extra",
      type: "object",
      description:
        "The subdomain hero's small eyebrow label and two 'proof point' checkmarks " +
        "below the CTAs, which the home hero does not have.",
      fields: [
        defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({
          name: "proofPoints",
          title: "Proof Points",
          description: "Exactly two short proof-point strings.",
          type: "array",
          of: [{ type: "string" }],
          validation: (r) => r.required().length(2),
        }),
      ],
    }),
    defineField({
      name: "navBadge",
      title: "Nav Badge",
      type: "string",
      description: "Small subdomain badge next to the wordmark, e.g. \"for Agencies\".",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "pain",
      title: "Pain Section",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "cards", type: "array", of: [{ type: "card" }] }),
      ],
    }),
    defineField({
      name: "capabilities",
      title: "Capabilities",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "intro", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({ name: "cards", type: "array", of: [{ type: "card" }] }),
      ],
    }),
    defineField({
      name: "screenshot",
      title: "Screenshot",
      type: "screenshot",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "workflow",
      title: "Workflow",
      type: "object",
      description: "Modeled on the persona's 'templates' section: a flat list of short chips, not Card objects.",
      fields: [
        defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({ name: "items", type: "array", of: [{ type: "string" }] }),
      ],
    }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "object",
      description: "The persona-specific 'Live in ten minutes, not ten days' 4-step section.",
      fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "items", type: "array", of: [{ type: "step" }] }),
      ],
    }),
    defineField({ name: "faq", title: "FAQ", type: "array", of: [{ type: "faq" }] }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      fields: [
        defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
        defineField({ name: "gradientPhrase", title: "Gradient Phrase", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({
          name: "secondaryCta",
          title: "Secondary CTA",
          type: "string",
          description: "\"Not you? Pick another lane\" button routing back to the home persona picker.",
          validation: (r) => r.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { persona: "persona", title: "hero.headline" },
    prepare: ({ persona, title }) => ({
      title: title || "Persona Page",
      subtitle: persona,
    }),
  },
});
