import { defineField, defineType } from "sanity";

/**
 * Mirrors `Seo` in src/content/types.ts: { title: string; description: string }.
 */
export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
  ],
});
