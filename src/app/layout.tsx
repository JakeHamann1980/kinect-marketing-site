import type { Metadata } from "next";
import { hanken, instrument, plexMono } from "@/lib/fonts";
import PostHogProvider from "@/components/PostHogProvider";
import ConsentBanner from "@/components/ConsentBanner";
import WaitlistDialog from "@/components/WaitlistDialog";
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
    "A branded client portal for agencies, coaches and consultants: task boards, analytics and AI that explains the work. Flat pricing from $149, no per-seat fees.",
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
        {/* Task 15: PostHogProvider wraps every page so it can apply
            already-recorded consent (and react to live changes) regardless
            of which route mounts first; ConsentBanner is a sibling, not a
            child, since it renders its own fixed-position UI rather than
            wrapping page content. Task 16: WaitlistDialog is the same
            shape -- a fixed-position overlay mounted once here, opened by
            any "Start free" CTA anywhere in the tree via the
            kx-open-waitlist window event (see cta.ts). */}
        <PostHogProvider>{children}</PostHogProvider>
        <ConsentBanner />
        <WaitlistDialog />
      </body>
    </html>
  );
}
