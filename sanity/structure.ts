import type { StructureResolver } from "sanity/structure";

/**
 * Task 17 (Sanity Schemas + Studio). Pins the singletons (`homePage`,
 * `siteSettings`, since 2026-08-03 `pricingPage`, and since 2026-08-30
 * `platformPage`) as single non-list
 * entries, and lists `personaPage` (one document per persona) and
 * `legalPage` (one document per slug) as regular document lists. Any other
 * document type would fall through to Studio's default list via
 * `S.documentTypeListItems()`, but this project has no other types.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home Page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("Pricing Page")
        .id("pricingPage")
        .child(S.document().schemaType("pricingPage").documentId("pricingPage")),
      S.listItem()
        .title("Platform Page")
        .id("platformPage")
        .child(S.document().schemaType("platformPage").documentId("platformPage")),
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("personaPage").title("Persona Pages"),
      S.documentTypeListItem("legalPage").title("Legal Pages"),
    ]);
