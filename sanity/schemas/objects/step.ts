import { defineField, defineType } from "sanity";

/**
 * Mirrors `Step` in src/content/types.ts:
 * { number: string; title: string; body: string }.
 * `number` is a string (e.g. "01"), not an integer, matching the source type.
 */
export default defineType({
  name: "step",
  title: "Step",
  type: "object",
  fields: [
    defineField({ name: "number", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "title", subtitle: "number" },
  },
});
