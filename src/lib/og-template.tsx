import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { Persona } from "@/lib/personas";
import { PERSONAS } from "@/lib/personas";
import { SITE_HOST } from "@/lib/seo";
import { balanceLines, measureText, parseFontMetrics, type FontMetrics } from "@/lib/og-measure";

/**
 * Task 21 (OG Images + Preview Metadata). Shared layout module for every
 * `opengraph-image.tsx` file-convention route (home, pricing, platform, the
 * four lane pages, the generic legal variant) so each of those files stays
 * a thin "content in, ImageResponse out" wrapper instead of duplicating
 * this layout eight times.
 *
 * PLACEMENT RULE (learned the hard way): the file must live in the SAME
 * route segment as the `page.tsx` it decorates. Next attaches file-based
 * images per segment, and a page whose `generateMetadata` returns an
 * `openGraph` block (every page here does, via `pageMetadata`) replaces the
 * inherited block, images included, before its own segment's file is
 * re-attached (`mergeMetadata` then `mergeStaticMetadata` in
 * next/dist/lib/metadata/resolve-metadata.js). A file one level up is
 * therefore silently ignored: home's card sat at `src/app/` for months
 * and `/` shipped with no `og:image` at all, as did `/pricing`, which had
 * no file. `e2e/og.spec.ts` now walks every sitemap URL on every host and
 * fails the suite if any page lacks a resolvable image, so a new page
 * cannot repeat that. Next's file-convention image routes
 * (`app/opengraph-image.tsx`, `app/<segment>/opengraph-image.tsx`) render
 * with `next/og`'s `ImageResponse`, which uses Satori (a constrained
 * HTML/CSS-subset-to-SVG renderer, not a browser) rather than actual
 * browser layout -- every constraint and workaround documented below is a
 * Satori limitation, not a design choice.
 *
 * Brand values (spec §8c): canvas #070B12, primary text #EEF2F8, muted
 * #8B95A7, mono eyebrow #5A6478, the three-stop gradient
 * #F5A15A -> #EC5242 -> #35D6E8 (`--text-gradient` in globals.css, at the
 * same 45% middle-stop position), and the three persona accents (agency
 * cyan #35D6E8, coach amber #F0913A, consultant violet #C7A0C0) all
 * hardcoded here as plain hex strings rather than imported from
 * globals.css's CSS custom properties -- Satori has no CSS cascade/`var()`
 * resolution, so every color consumed by an ImageResponse tree must be a
 * literal value at render time. `PERSONAS[persona].accent` is reused
 * directly (identical hex values already live there for the live site's
 * `[data-persona]` rules), so this file doesn't re-fork a second color
 * table for the same three colors.
 *
 * FONT LOADING (disclosed approach): `next/font/google`
 * (`src/lib/fonts.ts`'s `hanken` export, used by the live site) cannot be
 * reused here -- it returns a Tailwind/CSS class name and CSS variable for
 * browser `<link>`-based font loading, never raw font bytes, and Satori
 * needs an actual `ArrayBuffer` of font data up front (the `fonts` option
 * on `ImageResponse`). There is also no ready-made static TTF/OTF file for
 * Hanken Grotesk Bold anywhere in this repo or in `node_modules` (Google's
 * Fonts CDN only serves this family as WOFF/WOFF2, and Satori's bundled
 * font parser accepts TTF/OTF/WOFF -- **not** WOFF2, matching the
 * `@vercel/og` docs and this repo's own bundled fallback font,
 * `node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf`, which
 * ships as a plain static TTF for exactly this reason). Google's public
 * font repo (`github.com/google/fonts`) only carries Hanken Grotesk as a
 * single variable font (`HankenGrotesk[wght].ttf`, one file spanning the
 * whole weight axis) -- Satori does not perform variable-font axis
 * instancing at render time, so using that file directly risks rendering
 * at whatever the font's default/rest weight is instead of true 700.
 *
 * Resolution: a static, non-variable Bold (weight 700) instance was
 * generated once, offline, with `fonttools`'s variable-font instancer
 * (`fonttools varLib.instancer HankenGrotesk[wght].ttf wght=700`) against
 * that same open-source (OFL-licensed) variable font, and the resulting
 * static TTF was committed at `src/app/og/_fonts/HankenGrotesk-Bold.ttf`
 * (license text alongside it at `src/app/og/_fonts/OFL.txt`) so every
 * build reads real bytes off disk with no network fetch and no
 * variable-font instancing left for Satori to get wrong. `loadHeadlineFont`
 * below reads that file with `node:fs/promises` -- these image routes run
 * on the default Node.js runtime (never `export const runtime = "edge"`),
 * specifically so this plain filesystem read works both at build time
 * (static generation, since none of these routes take dynamic params
 * except the legal one, which is enumerated via `generateStaticParams`)
 * and if ever hit at request time.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_SIZE = { width: OG_WIDTH, height: OG_HEIGHT };

const CANVAS = "#070B12";
const TEXT = "#EEF2F8";
const MUTED = "#8B95A7";
const EYEBROW_COLOR = "#5A6478";

/** The three brand stops from the headline gradient (globals.css
 * `--text-gradient`: `linear-gradient(95deg, #F5A15A, #EC5242 45%,
 * #35D6E8)`), used as exact, unblended hex values by `stepColor` below. */
const GRADIENT_STEPS = ["#F5A15A", "#EC5242", "#35D6E8"];

/**
 * Assigns word `index` (of `total`) one of `GRADIENT_STEPS`' three exact
 * hex values -- a discrete step, never a blended color between them.
 * Satori has no `background-clip: text` (confirmed against the bundled
 * Satori/`@vercel/og` build: it supports `color`/`background` per element
 * but not clipping a background to text glyphs), so the live site's
 * single `background: var(--text-gradient); background-clip: text`
 * treatment (`.kx-grad` in globals.css, applied by
 * `renderWithGradient.tsx`) has no direct Satori equivalent, and
 * per-word solid colors stepping across the same three stops is the
 * spec-prescribed approximation. An earlier version of this function
 * continuously RGB-interpolated between stops (matching a CSS
 * `linear-gradient`'s per-pixel blend); that produced a visibly muddy
 * grey-brown on whichever word landed near the crossover between the
 * coral (#EC5242) and cyan (#35D6E8) stops -- naive RGB lerp between
 * near-complementary hues passes through grey, a well-known color-
 * science pitfall a real per-pixel gradient render never exposes (each
 * pixel shifts by an imperceptible amount) but a single flat word-color
 * does. Stepping through the exact brand hex values (never a value
 * in-between) avoids that entirely, at the cost of adjacent words
 * sometimes sharing a color on longer phrases -- an explicit, disclosed
 * trade-off in favor of every rendered color always being a real brand
 * value.
 */
function stepColor(index: number, total: number): string {
  if (total <= 1) return GRADIENT_STEPS[1];
  const bucket = Math.min(GRADIENT_STEPS.length - 1, Math.floor((index * GRADIENT_STEPS.length) / total));
  return GRADIENT_STEPS[bucket];
}

/**
 * Splits `headline` into `before` / gradient-phrase / `after` word runs
 * (the same split `renderWithGradient.tsx` does for the live site) and
 * returns a flat list of `{ text, color }` words in original order: plain
 * `TEXT`-colored words either side of the phrase, and the phrase's own
 * words each colored by `stepColor` at their position within *just that
 * phrase* (so a short phrase still visibly steps amber -> coral -> cyan
 * rather than sitting at one color). Falls back to rendering the whole
 * headline in plain `TEXT` (like `renderWithGradient`'s own dev-only
 * fallback) if the phrase isn't found verbatim.
 */
function gradientWords(headline: string, gradientPhrase: string): { text: string; color: string }[] {
  const index = headline.indexOf(gradientPhrase);
  if (index === -1) {
    return headline.split(" ").map((text) => ({ text, color: TEXT }));
  }

  const before = headline.slice(0, index).trim();
  const after = headline.slice(index + gradientPhrase.length).trim();
  const phraseWords = gradientPhrase.trim().split(/\s+/).filter(Boolean);

  const words: { text: string; color: string }[] = [];
  if (before) words.push(...before.split(/\s+/).filter(Boolean).map((text) => ({ text, color: TEXT })));
  phraseWords.forEach((text, i) => {
    words.push({ text, color: stepColor(i, phraseWords.length) });
  });
  if (after) words.push(...after.split(/\s+/).filter(Boolean).map((text) => ({ text, color: TEXT })));

  return words;
}

/**
 * Reads the pre-generated static Hanken Grotesk Bold TTF (see this file's
 * top doc comment) off disk. `process.cwd()` is the project root under
 * Next's build/server process, matching the pattern used throughout the
 * Vercel OG examples for bundling local font assets.
 */
let headlineFont: Promise<ArrayBuffer> | undefined;
function loadHeadlineFont(): Promise<ArrayBuffer> {
  headlineFont ??= readFile(join(process.cwd(), "src", "app", "og", "_fonts", "HankenGrotesk-Bold.ttf")).then(
    (buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
  );
  return headlineFont;
}

let headlineMetrics: Promise<FontMetrics> | undefined;
function loadHeadlineMetrics(): Promise<FontMetrics> {
  headlineMetrics ??= loadHeadlineFont().then(parseFontMetrics);
  return headlineMetrics;
}

export async function ogFonts() {
  const data = await loadHeadlineFont();
  return [{ name: "Hanken Grotesk", data, weight: 700 as const, style: "normal" as const }];
}

const screenshotCache = new Map<string, Promise<string>>();

/**
 * Reads a product screenshot from `public/` (the same files the site's hero
 * showcase renders, e.g. `/screenshots/analytics-full.png`) and returns it
 * as a base64 data URI. Satori accepts `<img src="data:...">` but cannot
 * fetch a URL at build time, and these routes must not depend on the
 * network anyway (see `loadHeadlineFont`). The PNGs are 300 KB to 1 MB on
 * disk; that is the render input only, the output card is still a
 * 1200x630 PNG rasterised once at build. Cached per path because the
 * persona and home routes share files across a single build.
 */
export function loadScreenshot(publicPath: string): Promise<string> {
  let cached = screenshotCache.get(publicPath);
  if (!cached) {
    cached = readFile(join(process.cwd(), "public", publicPath)).then(
      (buffer) => `data:image/png;base64,${buffer.toString("base64")}`,
    );
    screenshotCache.set(publicPath, cached);
  }
  return cached;
}

/**
 * Approximates the live site's `.kx-grid` 104px line grid (globals.css,
 * ~line 369-375) as a set of absolutely-positioned 1px divs -- Satori
 * cannot render the live site's actual `background-image:
 * repeating-linear-gradient(...)`/multi-layer `background` shorthand (its
 * background-image support is limited to a single solid color or a plain
 * `linear-gradient()`/`radial-gradient()` value, not the dot+line composite
 * the real CSS uses), so this is a disclosed approximation: real vertical/
 * horizontal border lines at the same 104px spacing, at a slightly higher
 * opacity (0.06 vs. the live site's 0.016) than the live CSS var
 * (`--grid-line`) -- at that literal opacity the lines are invisible once
 * flattened to a PNG and re-compressed by a chat client's own thumbnailer,
 * which the live, subpixel-AA'd browser rendering never has to survive.
 */
function GridLines() {
  const lineColor = "rgba(255,255,255,0.06)";
  const verticals: ReactNode[] = [];
  for (let x = 104; x < OG_WIDTH; x += 104) {
    verticals.push(
      <div
        key={`v-${x}`}
        style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 1, background: lineColor }}
      />,
    );
  }
  const horizontals: ReactNode[] = [];
  for (let y = 104; y < OG_HEIGHT; y += 104) {
    horizontals.push(
      <div
        key={`h-${y}`}
        style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, background: lineColor }}
      />,
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {verticals}
      {horizontals}
    </div>
  );
}

/** The KINECT asterisk mark (same geometry as `AsteriskMark.tsx`/
 * `public/icon.svg`), inlined as raw SVG -- Satori's Satori/`@vercel/og`
 * build passes plain `<svg>` subtrees through to the output largely as-is
 * (confirmed against the bundled build), so the exact same four-line
 * markup renders identically here with no React component reuse needed
 * (that component brings in `cn`/Tailwind classing this render tree has no
 * use for). Always solid brand cyan, matching the live site's persona-
 * agnostic root `--accent` default -- the persona accent shows up
 * elsewhere in this layout (the badge below), not on the mark itself.
 */
function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <g stroke="#35D6E8" strokeWidth={3} strokeLinecap="round">
        <line x1={16} y1={4} x2={16} y2={28} />
        <line x1={4} y1={16} x2={28} y2={16} />
        <line x1={7.5} y1={7.5} x2={24.5} y2={24.5} />
        <line x1={24.5} y1={7.5} x2={7.5} y2={24.5} />
      </g>
    </svg>
  );
}

interface OgTemplateProps {
  /** Small mono uppercase label above the headline (e.g. a persona's
   * `heroExtra.eyebrow`, or a generic label for home/legal). */
  eyebrow: string;
  headline: string;
  /** Verbatim substring of `headline` to render with the stepped
   * gradient; omit for the legal generic variant (plain headline only). */
  gradientPhrase?: string;
  /** Persona badge (mirrors `Nav.tsx`'s `badge` prop, e.g. "for
   * Agencies") + accent dot, shown next to the lockup; omitted for home
   * and legal pages, which carry no persona. */
  persona?: Persona;
  personaBadge?: string;
  /** Muted footer line, e.g. the page's hostname. */
  footer: string;
  /**
   * Optional one-line fact beneath the headline in muted type, e.g. the
   * four plan prices on the pricing card. Kept to a single sentence or two;
   * anything longer is unreadable at the ~500px width chat clients show.
   */
  detail?: string;
  /**
   * Optional product screenshot as a data URI (see `loadScreenshot`). When
   * present the card becomes the "product" variant: the headline column
   * narrows to the left 600px and the screenshot sits in a framed window
   * that bleeds off the bottom-right edge, its top-left corner (the app's
   * sidebar and first row of the view) the part that stays visible. Cards
   * without it are the "statement" variant: headline only, full width.
   */
  screenshot?: string;
}

/**
 * Decides the line breaks for a row of words ourselves rather than
 * leaving them to Satori's greedy wrap, so no card ends with a lone word
 * on its last line (see `src/lib/og-measure.ts`). `columnWidth` is the
 * true column; a 12px margin is held back because our widths ignore
 * kerning and Satori's wrap must never fire before ours. Returns the set
 * of word indices after which a break is forced, rendered as full-width
 * flex spacers, the Satori-safe way to break a wrapping row, plus the
 * word gap: the font's own space glyph at this size, so the row reads as
 * a sentence rather than as evenly spaced tiles (a fixed 16px looked
 * right at 58px and like justified text at 22px).
 */
function breaksFor(
  metrics: FontMetrics,
  words: string[],
  { fontSize, letterSpacing, columnWidth }: { fontSize: number; letterSpacing: number; columnWidth: number },
): { breaks: Set<number>; gap: number } {
  const gap = Math.round(measureText(metrics, " ", fontSize, letterSpacing));
  const widths = words.map((word) => measureText(metrics, word, fontSize, letterSpacing));
  const lines = balanceLines(widths, columnWidth - 12, gap);
  const breaks = new Set<number>();
  for (const line of lines.slice(0, -1)) breaks.add(line[line.length - 1]);
  return { breaks, gap };
}

/** A wrapping row of words with our own breaks, the headline's building
 * block and the detail line's. `words` carry their color; the spacer after
 * a break index pushes the rest of the row onto the next line. */
function WordRow({
  words,
  breaks,
  gap,
  style,
}: {
  words: { text: string; color: string }[];
  breaks: Set<number>;
  gap: number;
  style: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {words.flatMap((word, i) => {
        const el = (
          <div key={`${word.text}-${i}`} style={{ color: word.color, marginRight: gap, display: "flex" }}>
            {word.text}
          </div>
        );
        return breaks.has(i) ? [el, <div key={`break-${i}`} style={{ width: "100%", display: "flex" }} />] : [el];
      })}
    </div>
  );
}

/**
 * The shared 1200x630 canvas every `opengraph-image.tsx` file renders.
 * Returns a plain React element tree (not a component-invoking JSX
 * `<OgTemplate />`) so callers pass it straight into `new
 * ImageResponse(...)` without an extra component layer Satori would have
 * to resolve.
 */
export async function ogTemplate({
  eyebrow,
  headline,
  gradientPhrase,
  persona,
  personaBadge,
  footer,
  detail,
  screenshot,
}: OgTemplateProps): Promise<ReactElement> {
  const metrics = await loadHeadlineMetrics();
  const words = gradientPhrase ? gradientWords(headline, gradientPhrase) : headline.split(" ").map((text) => ({ text, color: TEXT }));
  const headlineColumn = screenshot ? 600 : 980;
  const headlineSize = screenshot ? 50 : 58;
  const headlineRow = breaksFor(
    metrics,
    words.map((word) => word.text),
    { fontSize: headlineSize, letterSpacing: -1, columnWidth: headlineColumn },
  );
  const detailWords = detail ? detail.split(/\s+/).filter(Boolean).map((text) => ({ text, color: MUTED })) : [];
  const detailRow = breaksFor(
    metrics,
    detailWords.map((word) => word.text),
    { fontSize: 22, letterSpacing: -0.2, columnWidth: 900 },
  );
  const accent = persona ? PERSONAS[persona].accent : "#35D6E8";
  const accentTint = persona ? PERSONAS[persona].tint : "rgba(53,214,232,.14)";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: CANVAS,
        padding: "64px 76px",
        position: "relative",
        fontFamily: "Hanken Grotesk",
      }}
    >
      <GridLines />

      {/* Lockup (top-left): mark + divider + wordmark, plus the persona
          badge (accent dot + name) for persona variants -- mirrors
          `Nav.tsx`'s own `<Lockup /> + badge pill` pairing. */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Mark size={26} />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.22)" }} />
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: TEXT,
            }}
          >
            KINECT
          </div>
        </div>

        {persona && personaBadge ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px",
              borderRadius: 6,
              background: accentTint,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: 999, background: accent, display: "flex" }} />
            <div
              style={{
                fontSize: 13,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {personaBadge}
            </div>
          </div>
        ) : null}
      </div>

      {/* Headline block (center-weighted, per §8c). Narrower and one step
          smaller when a screenshot shares the canvas, so the two never
          overlap: 76px padding + 600px column ends at x=676, and the
          screenshot frame starts at x=700. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "relative",
          maxWidth: headlineColumn,
        }}
      >
        <div
          style={{
            fontSize: 13,
            letterSpacing: 2.6,
            textTransform: "uppercase",
            color: EYEBROW_COLOR,
          }}
        >
          {eyebrow}
        </div>
        <WordRow
          words={words}
          breaks={headlineRow.breaks}
          gap={headlineRow.gap}
          style={{ fontSize: headlineSize, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}
        />
        {detailWords.length > 0 ? (
          <WordRow
            words={detailWords}
            breaks={detailRow.breaks}
            gap={detailRow.gap}
            style={{ fontSize: 22, lineHeight: 1.4, letterSpacing: -0.2, maxWidth: 900 }}
          />
        ) : null}
      </div>

      {/* Product window (product variant only). Rendered after the headline
          so it paints on top; absolutely positioned and deliberately larger
          than the space left for it, so it bleeds off the bottom and right
          edges like a window sitting just off-canvas. The <img> keeps the
          screenshot's own aspect ratio (all five in public/screenshots are
          roughly 3:2), so 760 wide is about 520 tall, and the visible part
          is the app's sidebar plus the first row of the view. Satori
          supports border, border-radius, overflow: hidden and box-shadow,
          all confirmed against the bundled build. */}
      {screenshot ? (
        <div
          style={{
            position: "absolute",
            left: 700,
            top: 150,
            width: 760,
            display: "flex",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            background: "#0D1320",
          }}
        >
          {/* Satori render tree, not a DOM page: next/image has no meaning here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={screenshot} width={760} alt="" style={{ objectFit: "cover" }} />
        </div>
      ) : null}

      {/* Footer: muted hostname line. */}
      <div
        style={{
          display: "flex",
          fontSize: 15,
          letterSpacing: 1,
          color: MUTED,
          position: "relative",
        }}
      >
        {footer}
      </div>
    </div>
  );
}

export { SITE_HOST };
