import { defineField, defineType } from "sanity";

/**
 * Mirrors `Faq` in src/content/types.ts: { question: string; answer: string }.
 */
export default defineType({
  name: "faq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 3, validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "question" },
  },
});
