import type { Metadata } from "next";
import { hanken, instrument, plexMono } from "@/lib/fonts";
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
        className="min-h-full flex flex-col"
        style={{
          background: "var(--dark-bg)",
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
