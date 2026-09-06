import type { PricingPageContent, Tier } from "@/content/types";
import { cn } from "@/lib/cn";

interface ComparisonTableProps {
  comparison: PricingPageContent["comparison"];
  /** Shared tier table from SiteSettings.pricing -- supplies the column
   * headers (and prices) so the matrix can never drift from the cards. */
  tiers: Tier[];
}

/**
 * Renders one matrix value. The content contract (src/content/types.ts,
 * `PricingPageContent`) reserves two sentinels for glyph treatment: "yes"
 * draws the accent check, "no" draws a muted dash, each paired with
 * screen-reader text since a glyph alone says nothing. "soon" renders the
 * word itself, for a feature that is coming but not shipped. Anything else
 * ("Up to 5", "Unlimited", "None") renders verbatim. Shared by both the
 * desktop table and the mobile stacked cards so the sentinel handling can
 * never diverge between the two layouts.
 */
function Value({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <>
        <svg
          viewBox="0 0 16 16"
          width={16}
          height={16}
          aria-hidden="true"
          className="text-accent-light"
        >
          <path
            d="M3 8.5L6.5 12L13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === "soon") {
    // Built into the table rather than footnoted: the previous treatment was
    // a bare "(*)" on the tier cards with no legend anywhere, which reads as
    // "conditions apply" while stating no condition. A word in the cell
    // cannot dangle.
    return (
      <span className="font-mono text-[11px] italic uppercase tracking-[.1em] text-accent-light opacity-60">
        Soon
      </span>
    );
  }
  if (value === "no") {
    return (
      <>
        <span aria-hidden="true" className="text-muted">
          &ndash;
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <>{value}</>;
}

/**
 * The /pricing page's feature comparison matrix (user-directed 2026-08-03,
 * structure modeled on momentifyapp.com/pricing's plan table). Light
 * treatment only -- it lives on the light /pricing page between the tier
 * cards and the FAQ.
 *
 * TWO layouts, swapped at kx-md (860px), because a 4-column matrix does not
 * survive a phone. Above the breakpoint: the real comparison table, where
 * scanning across tiers is the whole point. Below it (user-directed
 * 2026-08-03): one card per tier, each listing every row for that tier
 * only. A shrunk-to-fit table was the first attempt and it read badly --
 * every label wrapped to three lines and the tier headers scrolled out of
 * view, so you lost track of which column you were reading.
 *
 * Both layouts render the same data; the inactive one is `display: none`,
 * which also removes it from the accessibility tree, so screen readers meet
 * exactly one copy. Freeing the table from phone duty also let its cells go
 * back to comfortable desktop padding and type.
 */
export default function ComparisonTable({ comparison, tiers }: ComparisonTableProps) {
  return (
    <>
      {/* Desktop and up: the comparison table. `overflow-x-auto` stays as a
          safety net for tablet widths; there is deliberately no `min-width`
          -- one shipped at 640px and made the whole document pan sideways
          on a phone (see the mobile e2e regression guard). */}
      <div className="hidden overflow-x-auto rounded-[14px] border border-border bg-surface kx-md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {/* 40% -> 28% with the fourth tier. At 40% the four value
                  columns would have been 15% each -- about 150px, minus
                  px-6 both sides leaves ~102px for strings like
                  "$10 / 100 GB". At 28% they get 18% each. The label column
                  can afford it: its longest string wraps to two lines either
                  way. Padding also drops from px-6 to px-4 until kx-lg.
                  Deliberately NOT solved with a min-width -- one shipped at
                  640px and made the whole document pan sideways on a phone;
                  e2e/pricing.spec.ts guards that at 390px. */}
              <th className="w-[28%] px-4 py-4 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-muted kx-lg:px-6">
                Compare plans
              </th>
              {tiers.map((tier) => (
                <th key={tier.name} className="px-4 py-4 kx-lg:px-6">
                  <div
                    className={cn(
                      "font-display text-[17px] font-bold",
                      tier.popular ? "text-accent-light" : "text-ink",
                    )}
                  >
                    {tier.name}
                  </div>
                  {/* Both intervals, always. The table is a Server Component
                      and the Monthly/Annual toggle lives in the client-side
                      tier cards above it; pulling the whole matrix into that
                      boundary for one header line is not worth it, and two
                      figures side by side is the honest static answer. */}
                  <div className="mt-0.5 text-[13px] font-medium text-muted">
                    ${tier.price.toLocaleString("en-US")}
                    <span>/mo</span>
                    {typeof tier.annualPrice === "number" ? (
                      <>
                        <span className="mx-1.5 text-border" aria-hidden="true">
                          ·
                        </span>
                        ${tier.annualPrice.toLocaleString("en-US")}
                        <span>/yr</span>
                      </>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {comparison.groups.map((group) => (
            <tbody key={group.heading}>
              <tr>
                <th
                  colSpan={tiers.length + 1}
                  className="border-t border-border bg-light-canvas px-4 py-[10px] kx-lg:px-6 text-left font-mono text-[11px] font-medium uppercase tracking-[.14em] text-ink-3"
                >
                  {group.heading}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label}>
                  <td className="border-t border-divider px-4 py-[13px] text-[15px] text-ink-2 text-pretty kx-lg:px-6">
                    {row.label}
                  </td>
                  {row.values.map((value, i) => (
                    <td
                      key={tiers[i]?.name ?? i}
                      className="border-t border-divider px-4 py-[13px] text-[15px] text-ink-2 kx-lg:px-6"
                    >
                      <Value value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {/* Phones: one card per tier, so each plan reads as a complete list
          instead of a cramped column. Rows a tier does NOT include stay
          visible with a dash rather than being dropped -- what a plan
          leaves out is half of what a comparison is for. */}
      <div className="flex flex-col gap-4 kx-md:hidden">
        {tiers.map((tier, tierIndex) => (
          <div
            key={tier.name}
            className={cn(
              "overflow-hidden rounded-[14px] border bg-surface",
              tier.popular ? "border-accent-light" : "border-border",
            )}
          >
            <div className="flex items-baseline justify-between gap-3 px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-display text-[18px] font-bold",
                    tier.popular ? "text-accent-light" : "text-ink",
                  )}
                >
                  {tier.name}
                </span>
                {tier.popular ? (
                  <span className="font-mono text-[10px] uppercase tracking-[.1em] text-accent-light">
                    Most popular
                  </span>
                ) : null}
              </div>
              <span className="text-right text-[14px] font-medium text-muted">
                ${tier.price.toLocaleString("en-US")}
                <span>/mo</span>
                {typeof tier.annualPrice === "number" ? (
                  <>
                    <br />
                    ${tier.annualPrice.toLocaleString("en-US")}
                    <span>/yr</span>
                  </>
                ) : null}
              </span>
            </div>

            {comparison.groups.map((group) => (
              <div key={group.heading}>
                <div className="border-t border-border bg-light-canvas px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-[.14em] text-ink-3">
                  {group.heading}
                </div>
                <ul>
                  {group.rows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-start justify-between gap-4 border-t border-divider px-4 py-[11px]"
                    >
                      <span className="text-[14px] leading-[1.45] text-ink-2 text-pretty">
                        {row.label}
                      </span>
                      <span className="flex shrink-0 items-center pt-[2px] text-[14px] text-ink-2">
                        <Value value={row.values[tierIndex]} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
