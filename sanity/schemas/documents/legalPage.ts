import { defineField, defineType } from "sanity";

/**
 * Mirrors `LegalPage` in src/content/legal/types.ts. One document per legal
 * page (privacy, terms, security, cookies).
 *
 * Deviation from the design spec (§3, which mentions "prose body (Portable
 * Text)"): the shipped `LegalPage` type and its `/legal/[slug]` template
 * render `sections: { heading; paragraphs: string[] }[]` -- plain arrays of
 * paragraph strings, not Portable Text blocks. This schema follows the code
 * that actually ships rather than the spec's Portable Text mention, since
 * Task 17's brief is to mirror src/content/types.ts (and legal/types.ts)
 * exactly. Switching to Portable Text later would be a template + schema
 * migration, not a pure content change.
 *
 * `slug` is a plain string (not Sanity's `slug` field type, which produces
 * `{ current: string }`) so the document shape matches `LegalPage.slug:
 * string` verbatim; it doubles as the route param the `/legal/[slug]`
 * template and its `generateStaticParams` use to resolve content, so it must
 * stay one of the four filenames used today.
 */
export default defineType({
  name: "legalPage",
  title: "Legal Page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "string",
      options: {
        list: [
          { title: "Privacy", value: "privacy" },
          { title: "Terms", value: "terms" },
          { title: "Security", value: "security" },
          { title: "Cookies", value: "cookies" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "updated",
      title: "Last Updated",
      type: "date",
      description: "Rendered as the page's \"Last updated\" line.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "legalSection",
          fields: [
            defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              description: "Plain paragraph strings, not Portable Text -- see the schema's top comment.",
              type: "array",
              of: [{ type: "text", rows: 3 }],
              validation: (r) => r.required().min(1),
            }),
          ],
          preview: { select: { title: "heading" } },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "seo", type: "seo", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug" },
  },
});
