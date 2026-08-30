import { defineField, defineType } from "sanity";

/**
 * Mirrors `PlatformPageContent` in src/content/types.ts (the /platform
 * product overview, promoted out of draft 2026-08-30). Singleton document,
 * id "platformPage", pinned in sanity/structure.ts like pricingPage.
 *
 * Each section's `id` is the on-page anchor the footer's Platform column
 * links to (/platform#client-portal etc, see src/content/settings.ts), so
 * renaming one here breaks a live footer link -- the validation note on the
 * field says so where an editor will actually read it.
 *
 * `screenshot` reuses the shared screenshot object (image asset + alt +
 * caption) and is optional: only sections with a real product capture carry
 * one. The image's aspect ratio is not a field here -- the projection reads
 * it off the uploaded asset's own metadata (see src/lib/sanity.ts).
 */
export default defineType({
  name: "platformPage",
  title: "Platform Page",
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
      name: "sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "platformSection",
          fields: [
            defineField({
              name: "id",
              title: "Anchor ID",
              description:
                "The section's #anchor. The footer's Platform column links straight to these, so change the footer links in Site Settings in the same edit.",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required() }),
            defineField({
              name: "points",
              type: "array",
              of: [{ type: "string" }],
              validation: (r) => r.required().min(1),
            }),
            defineField({
              name: "screenshot",
              description:
                "Optional product capture rendered under the checklist. Leave empty for sections without a real capture of that capability.",
              type: "screenshot",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "id" },
          },
        },
      ],
      validation: (r) => r.required().min(1),
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
    prepare: () => ({ title: "Platform Page" }),
  },
});
