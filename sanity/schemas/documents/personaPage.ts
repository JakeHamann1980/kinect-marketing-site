import { defineField, defineType } from "sanity";

/**
 * Mirrors `PersonaPageContent` in src/content/types.ts. One document per
 * persona (agency, coach, consultant) -- not a singleton, but `persona` is
 * constrained to the three known values and should be unique per document
 * (enforced editorially; Sanity has no native "max one document per enum
 * value" constraint).
 *
 * `screenshot` (src/alt/caption) stays plain strings, not a Sanity `image`
 * asset: per the spec's Out-of-Scope note, product screenshots are
 * versioned build assets re-captured from the live app (not editorial
 * uploads), so they continue to live as static files in the repo/public
 * directory and this field only stores the reference path/alt/caption.
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
      type: "object",
      description:
        "References a static build asset (src/app/*, public/*) rather than a Sanity " +
        "image upload -- see the schema file's top comment for why.",
      fields: [
        defineField({ name: "src", title: "Source Path", type: "string", validation: (r) => r.required() }),
        defineField({ name: "alt", type: "string", validation: (r) => r.required() }),
        defineField({ name: "caption", type: "string", validation: (r) => r.required() }),
      ],
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
