import { defineField, defineType } from "sanity";

/**
 * Mirrors `Tier` in src/content/types.ts:
 * { name: string; price: number; popular?: boolean; features: string[]; cta: string }.
 */
export default defineType({
  name: "tier",
  title: "Pricing Tier",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "price", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "popular", type: "boolean", initialValue: false }),
    defineField({
      name: "features",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "cta", type: "string", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "name", subtitle: "price" },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? `$${subtitle}` : undefined }),
  },
});
