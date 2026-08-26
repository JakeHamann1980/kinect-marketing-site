import type { Metadata, Viewport } from "next";
import { hanken, instrument, plexMono } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

/**
 * Task 19 (Metadata, Robots, Sitemaps, Canonicals): every route below sets
 * its own complete `<title>` via `pageMetadata` (home, the three persona
 * pages, legal pages), so `template` is the identity function ("%s") rather
 * than appending a site suffix a second time -- page titles are already
 * absolute ("... | KINECT"). `default` only covers a route that adds no
 * metadata of its own.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KINECT | Client Portal Software Clients Actually Open",
    template: "%s",
  },
  description:
    "A branded client portal for agencies, professional services firms and consultants: task boards, analytics and AI that explains the work. Flat pricing from $149, no per-seat fees.",
};

/**
 * Task 21 (OG Images + Preview Metadata). `themeColor` (the color mobile
 * browser chrome/iMessage link-preview headers tint to) lives on a
 * dedicated `viewport` export rather than inside `metadata.themeColor` --
 * Next deprecated the latter in favor of this separate export, and this
 * repo's installed Next version (16.2.11) only reads the new location.
 * Site-wide (not per-page) since the brand canvas color is the same dark
 * `#070B12` everywhere; no page overrides it.
 */
export const viewport: Viewport = {
  themeColor: "#070B12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-dark-bg"
        style={{
          color: "var(--on-dark)",
          fontFamily: "var(--font-sans)",
          overflowX: "clip",
        }}
      >
        {children}
      </body>
    </html>
  );
}
