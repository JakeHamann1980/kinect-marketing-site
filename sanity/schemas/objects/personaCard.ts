import { defineField, defineType } from "sanity";

/**
 * Mirrors `HomeContent.personaCards` in src/content/types.ts:
 * `(Card & { persona: Persona; cta: string })[]`. Duplicates the `card`
 * object's fields (title/body/features) rather than referencing it, since
 * Sanity object schemas don't support type extension/spreading -- adding
 * `persona` and `cta` requires a distinct object type.
 */
export default defineType({
  name: "personaCard",
  title: "Persona Card",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "features", type: "array", of: [{ type: "string" }] }),
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
    defineField({ name: "cta", type: "string", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "title", subtitle: "persona" },
  },
});
