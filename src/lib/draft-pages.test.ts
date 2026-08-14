import { describe, it, expect } from "vitest";
import { visibleLinks, visibleFooterColumns } from "./draft-pages";

/**
 * user-directed 2026-08-03: "Docs" (nav) and "Platform" (footer column) are
 * built out for local testing but must NOT appear on the live site. These
 * pure filters are what enforce that, so they are tested in both states
 * directly rather than through a rendered component.
 */
// Typed explicitly rather than inferred: bare object literals with no
// `draft` key trip TypeScript's weak-type check against the `{draft?: ... }`
// constraint, and a mixed array infers a union the generics cannot narrow.
// These mirror the real `SiteSettings` shapes.
interface TestLink {
  label: string;
  href: string;
  draft?: boolean;
}
interface TestColumn {
  heading: string;
  draft?: boolean;
  links: TestLink[];
}

const NAV: TestLink[] = [
  { label: "Product", href: "#" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs", draft: true },
];

const COLUMNS: TestColumn[] = [
  { heading: "Solutions", links: [{ label: "For agencies", href: "/agency" }] },
  {
    heading: "Platform",
    draft: true,
    links: [{ label: "Client portal", href: "/platform" }],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Docs", href: "/docs", draft: true },
    ],
  },
];

describe("visibleLinks", () => {
  it("drops draft links when drafts are disabled (the live site)", () => {
    expect(visibleLinks(NAV, false).map((l) => l.label)).toEqual([
      "Product",
      "Pricing",
    ]);
  });

  it("keeps draft links when drafts are enabled (local testing)", () => {
    expect(visibleLinks(NAV, true).map((l) => l.label)).toEqual([
      "Product",
      "Pricing",
      "Docs",
    ]);
  });

  it("leaves a list with no draft entries untouched", () => {
    const plain: TestLink[] = [{ label: "Pricing", href: "/pricing" }];
    expect(visibleLinks(plain, false)).toEqual(plain);
  });
});

describe("visibleFooterColumns", () => {
  it("drops a draft column entirely when drafts are disabled", () => {
    expect(visibleFooterColumns(COLUMNS, false).map((c) => c.heading)).toEqual([
      "Solutions",
      "Company",
    ]);
  });

  it("also drops draft LINKS inside a column that itself ships", () => {
    const company = visibleFooterColumns(COLUMNS, false).find(
      (c) => c.heading === "Company",
    );
    expect(company?.links.map((l) => l.label)).toEqual(["About"]);
  });

  it("keeps everything when drafts are enabled", () => {
    const cols = visibleFooterColumns(COLUMNS, true);
    expect(cols.map((c) => c.heading)).toEqual(["Solutions", "Platform", "Company"]);
    expect(cols.find((c) => c.heading === "Company")?.links).toHaveLength(2);
  });

  it("drops a column whose links are ALL draft (no bare heading)", () => {
    const cols: TestColumn[] = [
      { heading: "Solutions", links: [{ label: "For agencies", href: "/agency" }] },
      {
        heading: "Resources",
        links: [
          { label: "Docs", href: "/docs", draft: true },
          { label: "Changelog", href: "#", draft: true },
        ],
      },
    ];
    expect(visibleFooterColumns(cols, false).map((c) => c.heading)).toEqual([
      "Solutions",
    ]);
    // ...but it is still there when drafts are on.
    expect(visibleFooterColumns(cols, true)).toHaveLength(2);
  });

  it("does not mutate the input", () => {
    const before = JSON.stringify(COLUMNS);
    visibleFooterColumns(COLUMNS, false);
    expect(JSON.stringify(COLUMNS)).toBe(before);
  });
});
