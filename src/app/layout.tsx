import type { Metadata } from "next";
import { hanken, instrument, plexMono } from "@/lib/fonts";
import PostHogProvider from "@/components/PostHogProvider";
import ConsentBanner from "@/components/ConsentBanner";
import WaitlistDialog from "@/components/WaitlistDialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "KINECT",
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
