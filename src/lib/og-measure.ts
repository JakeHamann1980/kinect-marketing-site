/**
 * Glyph measurement and line balancing for the OG cards.
 *
 * Satori (the renderer behind `next/og`'s ImageResponse) wraps a flex row
 * greedily and offers no `text-wrap: balance`, so a headline routinely
 * ends with one word alone on the last line ("working.", "dark."). The
 * cards render each word as its own flex item, which means we can decide
 * the breaks ourselves if we know how wide each word is. This module reads
 * the advance widths straight out of the static Hanken Grotesk Bold TTF
 * the cards already load (`hmtx` via a format 4 `cmap`), then balances
 * lines the way CSS `text-wrap: balance` does: the fewest lines the width
 * allows, made as even as possible, with a hard rule that the last line
 * carries at least two words.
 *
 * Kerning (the font has GPOS pairs, no `kern` table) is deliberately
 * ignored. Pairs almost always tighten, so an unkerned sum overestimates,
 * and an overestimate can only make us break a hair early, never let
 * Satori wrap a line we thought fit. Callers should still leave a small
 * margin under the true column width for the same reason.
 */

export interface FontMetrics {
  unitsPerEm: number;
  /** Advance width in font units for a code point; the `.notdef` width
   * (glyph 0) for anything the font does not map. */
  advance(codePoint: number): number;
}

function u16(view: DataView, offset: number): number {
  return view.getUint16(offset);
}

export function parseFontMetrics(buffer: ArrayBuffer): FontMetrics {
  const view = new DataView(buffer);
  const numTables = u16(view, 4);
  const tables = new Map<string, { offset: number; length: number }>();
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(record),
      view.getUint8(record + 1),
      view.getUint8(record + 2),
      view.getUint8(record + 3),
    );
    tables.set(tag, { offset: view.getUint32(record + 8), length: view.getUint32(record + 12) });
  }
  const need = (tag: string) => {
    const table = tables.get(tag);
    if (!table) throw new Error(`og-measure: font has no ${tag} table`);
    return table;
  };

  const unitsPerEm = u16(view, need("head").offset + 18);
  const numberOfHMetrics = u16(view, need("hhea").offset + 34);
  const hmtx = need("hmtx").offset;
  const advanceOfGlyph = (glyph: number) =>
    u16(view, hmtx + Math.min(glyph, numberOfHMetrics - 1) * 4);

  // cmap: prefer the Windows Unicode BMP subtable (3,1), else Unicode (0,x);
  // both are format 4 in this font. Format 4 maps BMP code points through
  // segments of [startCode, endCode] with either a delta or an offset into
  // glyphIdArray.
  const cmap = need("cmap").offset;
  const subtables = u16(view, cmap + 2);
  let format4 = -1;
  for (let i = 0; i < subtables; i++) {
    const platform = u16(view, cmap + 4 + i * 8);
    const offset = view.getUint32(cmap + 8 + i * 8);
    if (u16(view, cmap + offset) !== 4) continue;
    if (platform === 3 || format4 === -1) format4 = cmap + offset;
  }
  if (format4 === -1) throw new Error("og-measure: font has no format 4 cmap subtable");
  const segCount = u16(view, format4 + 6) / 2;
  const endCodes = format4 + 14;
  const startCodes = endCodes + segCount * 2 + 2;
  const idDeltas = startCodes + segCount * 2;
  const idRangeOffsets = idDeltas + segCount * 2;

  const glyphOf = (codePoint: number): number => {
    if (codePoint > 0xffff) return 0;
    for (let seg = 0; seg < segCount; seg++) {
      const end = u16(view, endCodes + seg * 2);
      if (codePoint > end) continue;
      const start = u16(view, startCodes + seg * 2);
      if (codePoint < start) return 0;
      const delta = u16(view, idDeltas + seg * 2);
      const rangeOffset = u16(view, idRangeOffsets + seg * 2);
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
      const glyphAddress = idRangeOffsets + seg * 2 + rangeOffset + (codePoint - start) * 2;
      const glyph = u16(view, glyphAddress);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };

  const cache = new Map<number, number>();
  return {
    unitsPerEm,
    advance(codePoint) {
      let width = cache.get(codePoint);
      if (width === undefined) {
        width = advanceOfGlyph(glyphOf(codePoint));
        cache.set(codePoint, width);
      }
      return width;
    },
  };
}

/** Rendered width of `text` in CSS pixels at `fontSize`, with Satori's
 * per-glyph `letterSpacing` applied to every glyph including the last. */
export function measureText(metrics: FontMetrics, text: string, fontSize: number, letterSpacing = 0): number {
  let units = 0;
  let glyphs = 0;
  for (const char of text) {
    units += metrics.advance(char.codePointAt(0) ?? 0);
    glyphs++;
  }
  return (units / metrics.unitsPerEm) * fontSize + glyphs * letterSpacing;
}

/** Greedy wrap: returns lines as arrays of word indices. Each word's outer
 * width is `widths[i] + gap` (a flex item's margin counts toward the line
 * in Yoga), so `gap` is charged on every word, the last one included. */
function wrapGreedy(widths: number[], gap: number, maxWidth: number): number[][] {
  const lines: number[][] = [];
  let line: number[] = [];
  let used = 0;
  widths.forEach((width, i) => {
    const outer = width + gap;
    if (line.length > 0 && used + outer > maxWidth) {
      lines.push(line);
      line = [];
      used = 0;
    }
    line.push(i);
    used += outer;
  });
  if (line.length > 0) lines.push(line);
  return lines;
}

/**
 * Balanced line breaks. Uses the fewest lines that fit `maxWidth` (the
 * greedy count, which is minimal), then chooses among all layouts with
 * that many lines the one with the least raggedness: the smallest sum of
 * squared slack per line, the classic minimum-raggedness objective. That
 * is what spreads "need a status meeting" across the lines evenly instead
 * of packing the first line and leaving a stub. The last line must carry
 * at least `minLastWords` words; if no layout with the minimal line count
 * can satisfy that (a two-word headline on two lines, say), the rule is
 * dropped rather than adding a line. Returns lines as arrays of word
 * indices; every index appears exactly once, in order.
 */
export function balanceLines(widths: number[], maxWidth: number, gap: number, minLastWords = 2): number[][] {
  const n = widths.length;
  if (n === 0) return [];
  const target = wrapGreedy(widths, gap, maxWidth).length;
  if (target === 1) return [widths.map((_, i) => i)];

  // slack[i][j]: squared unused width if words i..j-1 share a line, or
  // Infinity when they do not fit.
  const slack: number[][] = [];
  for (let i = 0; i < n; i++) {
    slack[i] = [];
    let width = 0;
    for (let j = i + 1; j <= n; j++) {
      width += widths[j - 1] + gap;
      slack[i][j] = width > maxWidth ? Infinity : (maxWidth - width) ** 2;
    }
  }

  const layout = (minLast: number): number[][] | null => {
    // best[k][j]: least total slack laying out words 0..j-1 on exactly k lines.
    const best: number[][] = Array.from({ length: target + 1 }, () => new Array<number>(n + 1).fill(Infinity));
    const from: number[][] = Array.from({ length: target + 1 }, () => new Array<number>(n + 1).fill(-1));
    best[0][0] = 0;
    for (let k = 1; k <= target; k++) {
      for (let j = 1; j <= n; j++) {
        for (let i = k - 1; i < j; i++) {
          if (k === target && j === n && j - i < minLast) continue;
          const cost = best[k - 1][i] + slack[i][j];
          if (cost < best[k][j]) {
            best[k][j] = cost;
            from[k][j] = i;
          }
        }
      }
    }
    if (!Number.isFinite(best[target][n])) return null;
    const lines: number[][] = [];
    for (let k = target, j = n; k > 0; k--) {
      const i = from[k][j];
      lines.unshift(Array.from({ length: j - i }, (_, offset) => i + offset));
      j = i;
    }
    return lines;
  };

  return layout(Math.min(minLastWords, n)) ?? layout(1) ?? wrapGreedy(widths, gap, maxWidth);
}
