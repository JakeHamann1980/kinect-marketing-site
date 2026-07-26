import { defineField, defineType } from "sanity";

/**
 * Mirrors `Card` in src/content/types.ts:
 * { title: string; body: string; features?: string[] }.
 */
export default defineType({
  name: "card",
  title: "Card",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body" },
  },
});
