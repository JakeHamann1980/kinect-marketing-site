import Image from "next/image";
import type { Card } from "@/content/types";
import type { home } from "@/content/home";

interface PillarCardsProps {
  pillars: Card[];
  /** home.bento -- optional distinct sub-layout rendered below the pillar grid. */
  bento?: (typeof home)["bento"];
}

/**
 * Icon glyphs + tile colors recovered verbatim from `design-reference/
 * KINECT Marketing Site.dc.html` (~line 519-521 for paths, ~line 586-588
 * for the bg/color pairs): `portal`, `chart`, `spark`, matched by array
 * position to home.ts's three pillars ("A portal they open", "Numbers,
 * not vibes", "AI that explains itself"). Content has no icon field of its
 * own (`Card` carries only title/body), so this table is index-keyed. A
 * fourth-or-later pillar (beyond what the source ever defined) falls back
 * to a plain asterisk glyph rather than inventing an unsourced icon.
 */
const PILLAR_ICONS: { paths: string[]; bg: string; color: string }[] = [
  { paths: ["M3 4h18v16H3z", "M3 9h18", "M8 14h7"], bg: "rgba(14,147,172,.12)", color: "#0E7C90" },
  { paths: ["M3 3v18h18", "M7 15l4-5 3 3 4-6"], bg: "rgba(53,214,232,.16)", color: "#35D6E8" },
  {
    paths: ["M12 3v3M12 18v3M3 12h3M18 12h3", "M12 8a4 4 0 100 8 4 4 0 000-8z"],
    bg: "rgba(240,145,58,.16)",
    color: "#F0913A",
  },
];

// Fallback for any pillar beyond the three the source ever defined an icon
// for -- a clean asterisk-family placeholder glyph, per the discipline note
// in the Task 11 brief, rather than fabricating an unsourced icon.
const FALLBACK_ICON = { paths: ["M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11"], bg: "rgba(90,100,119,.12)", color: "#5A6478" };

function PillarIcon({ paths, color }: { paths: string[]; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke={color}
      strokeWidth={2}
      aria-hidden="true"
      className="flex-none"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * Feature pillar cards (design-reference/README.md "6. Feature pillars
 * (light)"). Same card treatment as PersonaCard (52px icon tile leading,
 * per the Task 11 brief -- the prototype's own `iconWrap` defaults to 54px
 * for pillars specifically, but the site-wide 52px from the persona cards
 * is used here for cross-section consistency).
 *
 * When `bento` is supplied, also renders the distinct two-column sub-layout
 * beneath the pillar grid (design-reference/KINECT Marketing Site.dc.html
 * "5 · BENTO PILLARS", ~line 304-320): a wide "work, visible" card with a
 * bled screenshot, an AI-insight quote card, and a stat card.
 */
export default function PillarCards({ pillars, bento }: PillarCardsProps) {
  return (
    <div>
      {/*
        3-col grids hold 3 columns from kx-md (860px) straight through to
        desktop -- no kx-lg tier. Verified against the prototype's own
        responsive CSS (KINECT Marketing Site.dc.html <style>): the
        max-width:1024px block's grid override only matches the exact
        literal selector `[style*="grid-template-columns:repeat(4,1fr)"]`
        (line ~78), never `repeat(3,1fr)`, so 3-col grids are untouched at
        1024 and only collapse once the max-width:860px "every multi-col
        grid stacks" rule (line 85, which explicitly lists
        `repeat(3,1fr)` alongside `repeat(2,1fr)`/`repeat(4,1fr)`) forces
        them to 1fr. README's own wording ("<=1024px -- 4-column grids
        become 2") agrees: it never claims a 2-col step for 3-col grids
        either. StepCards' 4-col grid is the one family that legitimately
        gets the kx-md:2/kx-lg:4 intermediate step.
      */}
      <div className="grid grid-cols-1 gap-[18px] kx-md:grid-cols-3">
        {pillars.map((pillar, i) => {
          const icon = PILLAR_ICONS[i] ?? FALLBACK_ICON;
          return (
            <div
              key={pillar.title}
              className="flex flex-col rounded-[18px] border border-border bg-surface p-[32px_30px] shadow-[0_1px_3px_rgba(12,18,32,.05)]"
            >
              <div
                className="mb-[22px] flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px]"
                style={{ background: icon.bg }}
              >
                <PillarIcon paths={icon.paths} color={icon.color} />
              </div>
              <h3 className="font-display text-[23px] font-bold text-ink">{pillar.title}</h3>
              <p className="mt-[10px] text-[16px] leading-[1.55] text-ink-3">{pillar.body}</p>
            </div>
          );
        })}
      </div>

      {bento ? (
        <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface p-[30px_30px_0]">
            <h3 className="font-display text-[23px] font-bold text-ink">
              {bento.workVisible.title}
            </h3>
            <p className="mt-2 mb-[22px] max-w-[440px] text-[16px] leading-[1.55] text-ink-3">
              {bento.workVisible.body}
            </p>
            <div className="relative aspect-[2962/1996] overflow-hidden rounded-t-[12px] border border-border shadow-[0_-8px_30px_rgba(12,18,32,.1)]">
              <Image
                src="/screenshots/portal-board.png"
                alt="KINECT task board"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[18px]">
            {/*
              user-directed 2026-07-25: the prototype rendered this card
              dark (#0C1220, dc.html line 311); Jake asked for the same
              light warm-to-cool gradient wash the product UI uses on its
              plan cards (sampled from the "Practice plan" card in
              public/screenshots/consultant-hq.png: pale cream top-left
              into pale cyan bottom-right). Text colors flipped to the
              light-context ink family accordingly.
            */}
            <div
              className="rounded-[18px] border border-border p-[28px]"
              style={{
                background:
                  "linear-gradient(135deg, #F7EFE8 0%, #F0F4F2 48%, #DFF0EF 100%)",
              }}
            >
              {/* user-directed 2026-07-25: eyebrow rendered as a pill (same
                  badge language as the nav's persona pill: mono uppercase on
                  a tinted, fully rounded chip). Warm amber tint pairs with
                  the card's cream-to-cyan gradient. */}
              <div className="mb-3 inline-flex w-fit items-center rounded-full bg-[rgba(240,145,58,.16)] px-[10px] py-[3px] font-mono text-[11px] uppercase tracking-[.14em] text-coral-light">
                {bento.aiInsight.eyebrow}
              </div>
              <p className="text-[17px] leading-[1.55] text-ink-2">
                {"“"}
                {bento.aiInsight.quote}
                {"”"}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center rounded-[18px] border border-border bg-surface p-[28px]">
              <div className="kx-grad font-display text-[44px] font-bold leading-none">
                {bento.stat.value}
              </div>
              <p className="mt-2 text-[16px] leading-[1.5] text-ink-3">{bento.stat.caption}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
