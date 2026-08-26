import { defineField, defineType } from "sanity";

/**
 * Singleton document mirroring `SiteSettings` in src/content/types.ts. Pinned
 * as a singleton in the Studio structure (see sanity/structure.ts).
 */
export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "navLinks",
      title: "Nav Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "navLink",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "href", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "draft",
              type: "boolean",
              initialValue: false,
              description:
                "Hide from the LIVE site. Visible only with NEXT_PUBLIC_ENABLE_DRAFT_PAGES=1 (local). Use for destinations that are built but not approved to ship.",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "solutions",
      title: "Solutions Dropdown",
      type: "array",
      of: [
        {
          type: "object",
          name: "solutionsEntry",
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
            defineField({ name: "name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", type: "text", rows: 2, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "name", subtitle: "persona" } },
        },
      ],
    }),
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "object",
      fields: [
        defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
        defineField({ name: "supporting", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({
          name: "tiers",
          title: "Tiers",
          type: "array",
          of: [{ type: "tier" }],
          validation: (r) => r.required().min(1),
        }),
        defineField({
          name: "note",
          title: "Note",
          type: "text",
          rows: 2,
          description:
            "Trailing line under the pricing table. Optional -- currently pending a " +
            "product decision on per-lane pricing variation vs. the shared tier table " +
            "(see the comment on SiteSettings.pricing.note in src/content/types.ts).",
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({ name: "positioning", type: "text", rows: 2, validation: (r) => r.required() }),
        defineField({
          name: "columns",
          title: "Columns",
          type: "array",
          of: [
            {
              type: "object",
              name: "footerColumn",
              fields: [
                defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
                defineField({
                  name: "draft",
                  type: "boolean",
                  initialValue: false,
                  description: "Hide this whole column from the LIVE site (local-only until approved).",
                }),
                defineField({
                  name: "links",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      name: "footerLink",
                      fields: [
                        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
                        defineField({ name: "href", type: "string", validation: (r) => r.required() }),
                        defineField({
                          name: "draft",
                          type: "boolean",
                          initialValue: false,
                          description: "Hide this link from the LIVE site (local-only until approved).",
                        }),
                      ],
                    },
                  ],
                }),
              ],
              preview: { select: { title: "heading" } },
            },
          ],
        }),
        defineField({
          name: "legalLinks",
          title: "Legal Links",
          type: "array",
          of: [
            {
              type: "object",
              name: "legalLink",
              fields: [
                defineField({ name: "label", type: "string", validation: (r) => r.required() }),
                defineField({ name: "href", type: "string", validation: (r) => r.required() }),
                defineField({
                  name: "draft",
                  type: "boolean",
                  initialValue: false,
                  description: "Hide this link from the LIVE site (local-only until it has a real destination).",
                }),
              ],
            },
          ],
        }),
        defineField({ name: "copyright", type: "string", validation: (r) => r.required() }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
