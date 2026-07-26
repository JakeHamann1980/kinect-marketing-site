import type { StructureResolver } from "sanity/structure";

/**
 * Task 17 (Sanity Schemas + Studio). Pins the two singletons (`homePage`,
 * `siteSettings`) as single non-list entries, and lists `personaPage` (one
 * document per persona) and `legalPage` (one document per slug) as regular
 * document lists. Any other document type would fall through to Studio's
 * default list via `S.documentTypeListItems()`, but this project has no
 * other types.
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
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("personaPage").title("Persona Pages"),
      S.documentTypeListItem("legalPage").title("Legal Pages"),
    ]);
