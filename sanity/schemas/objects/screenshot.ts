import { defineField, defineType } from "sanity";

/**
 * Shared product-screenshot object. Product screenshots were originally
 * kept as plain repo-static string paths (see this file's git history / the
 * old comment on personaPage.ts's `screenshot` field) on the theory that
 * they are versioned build assets re-captured from the live app, not
 * editorial uploads. User-directed 2026-07-25: reversed -- editors need to
 * replace a screenshot from the Studio without waiting on a deploy, so the
 * image itself is now a real Sanity `image` asset (uploadable, hotspot-
 * croppable) instead of a hand-typed path. `caption` is optional here
 * because not every usage needs one (the home showcase cycler's three
 * per-persona screenshots have no caption in the UI); `personaPage.screenshot`
 * still always supplies one in practice, just not enforced at this shared
 * type's schema level.
 */
export default defineType({
  name: "screenshot",
  title: "Screenshot",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "alt", title: "Alt Text", type: "string", validation: (r) => r.required() }),
    defineField({ name: "caption", type: "string" }),
  ],
  preview: {
    select: { media: "image", title: "alt", subtitle: "caption" },
  },
});
