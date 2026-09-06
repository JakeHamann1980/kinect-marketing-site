import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { balanceLines, measureText, parseFontMetrics } from "./og-measure";

async function loadMetrics() {
  const buffer = await readFile(join(process.cwd(), "src", "app", "og", "_fonts", "HankenGrotesk-Bold.ttf"));
  return parseFontMetrics(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);
}

describe("parseFontMetrics against the real OG font", () => {
  it("reads the font's own unitsPerEm and orders glyph widths sensibly", async () => {
    const metrics = await loadMetrics();
    expect(metrics.unitsPerEm).toBe(1000);
    const w = (s: string) => measureText(metrics, s, 100);
    expect(w("W")).toBeGreaterThan(w("i"));
    expect(w(" ")).toBeGreaterThan(0);
    expect(w("KINECT")).toBeCloseTo(["K", "I", "N", "E", "C", "T"].reduce((sum, c) => sum + w(c), 0), 6);
  });

  it("falls back to .notdef instead of throwing on an unmapped character", async () => {
    const metrics = await loadMetrics();
    expect(() => measureText(metrics, "\u{1F600}", 50)).not.toThrow();
  });

  it("applies letterSpacing per glyph", async () => {
    const metrics = await loadMetrics();
    expect(measureText(metrics, "abc", 50, -1)).toBeCloseTo(measureText(metrics, "abc", 50) - 3, 6);
  });
});

describe("balanceLines", () => {
  const gap = 10;

  it("keeps a headline that fits on one line", () => {
    expect(balanceLines([100, 100, 100], 1000, gap)).toEqual([[0, 1, 2]]);
  });

  it("never lets the last line hold a single word", () => {
    // Greedy at 500 would give [0,1,2,3] then [4] alone.
    const widths = [110, 110, 110, 110, 110];
    const lines = balanceLines(widths, 500, gap);
    expect(lines[lines.length - 1].length).toBeGreaterThanOrEqual(2);
    expect(lines.flat()).toEqual([0, 1, 2, 3, 4]);
  });

  it("evens the lines out instead of a full line and a stub", () => {
    const widths = [100, 100, 100, 100, 100, 100];
    const lines = balanceLines(widths, 460, gap);
    // Greedy: 4 + 2. Balanced at the same line count: 3 + 3.
    expect(lines.map((l) => l.length)).toEqual([3, 3]);
  });

  it("uses the fewest lines the width allows and never exceeds it", () => {
    const widths = [180, 60, 220, 90, 140, 70, 200, 110];
    const maxWidth = 420;
    const lines = balanceLines(widths, maxWidth, gap);
    for (const line of lines) {
      expect(line.reduce((sum, i) => sum + widths[i] + gap, 0)).toBeLessThanOrEqual(maxWidth);
    }
    expect(lines.flat()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(lines[lines.length - 1].length).toBeGreaterThanOrEqual(2);
  });

  it("prefers a short first line over a lone last word", () => {
    // Three words, two per line at most: [0,1] [2] would orphan word 2, so
    // the balancer gives [0] [1,2]. A short FIRST line is not an orphan.
    expect(balanceLines([200, 200, 200], 430, gap)).toEqual([[0], [1, 2]]);
  });

  it("spreads words evenly rather than packing early lines and leaving a stub", () => {
    // The home headline shape at 50px in a 588px column: packing greedily
    // at the narrowest 4-line width gave "need a status" alone on line 2.
    const widths = [110, 160, 210, 110, 30, 140, 190, 50, 120, 90, 120, 40, 210];
    const lines = balanceLines(widths, 588, gap);
    expect(lines.length).toBe(4);
    const lineWidths = lines.map((line) => line.reduce((sum, i) => sum + widths[i] + gap, 0));
    // No interior line may be shorter than half the column; that is the stub.
    for (const width of lineWidths.slice(0, -1)) expect(width).toBeGreaterThan(588 / 2);
    expect(lines[lines.length - 1].length).toBeGreaterThanOrEqual(2);
    expect(lines.flat()).toEqual(widths.map((_, i) => i));
  });

  it("drops the two-word rule only when no layout can satisfy it", () => {
    // Two words that cannot share a line: the only two-line layout has a
    // single word last, and adding a third line is not an option.
    expect(balanceLines([300, 300], 400, gap)).toEqual([[0], [1]]);
  });
});
