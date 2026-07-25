import { Hanken_Grotesk, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
