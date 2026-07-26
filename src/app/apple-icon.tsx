import { ImageResponse } from "next/og";

/**
 * Task 21 (OG Images + Preview Metadata). Apple touch icon, via Next's
 * `apple-icon.tsx` file convention -- Next generates this at build time
 * and auto-wires `<link rel="apple-touch-icon">` to it. Apple's own touch-
 * icon spec requires a PNG (no SVG/ICO support), which is exactly what
 * `ImageResponse` rasterizes to, so the dynamic-file convention is the
 * natural fit here (unlike `icon.svg` below it, which ships as a plain
 * static SVG since browsers *do* accept SVG favicons).
 *
 * No custom font is loaded for this one: the tile carries only the
 * asterisk mark (four lines), never text, so there is nothing here for
 * Satori to shape with a font at all.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070B12",
        }}
      >
        <svg width={96} height={96} viewBox="0 0 32 32">
          <g stroke="#35D6E8" strokeWidth={3} strokeLinecap="round">
            <line x1={16} y1={4} x2={16} y2={28} />
            <line x1={4} y1={16} x2={28} y2={16} />
            <line x1={7.5} y1={7.5} x2={24.5} y2={24.5} />
            <line x1={24.5} y1={7.5} x2={7.5} y2={24.5} />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
