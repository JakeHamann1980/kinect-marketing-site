import type { PricingPageContent, Tier } from "@/content/types";
import { cn } from "@/lib/cn";

interface ComparisonTableProps {
  comparison: PricingPageContent["comparison"];
  /** Shared tier table from SiteSettings.pricing -- supplies the column
   * headers (and prices) so the matrix can never drift from the cards. */
  tiers: Tier[];
}

/**
 * The /pricing page's feature comparison matrix (user-directed 2026-08-03,
 * structure modeled on momentifyapp.com/pricing's plan table). Light
 * treatment only -- it lives on the light /pricing page between the tier
 * cards and the FAQ.
 *
 * Cell values are display strings from content, with two sentinels the
 * content contract (src/content/types.ts, PricingPageContent) reserves for
 * glyph rendering: "yes" draws the accent check with sr-only "Included",
 * "no" draws a muted dash with sr-only "Not included". Everything else
 * ("Up to 5", "Unlimited", "None") renders as text -- the same mix of
 * checks and literal values the Momentify reference table uses.
 */
export default function ComparisonTable({ comparison, tiers }: ComparisonTableProps) {
  return (
    // No `min-width` here (2026-08-03 mobile fix): a 640px minimum made the
    // whole PAGE pan sideways on a 390px viewport -- 158px of horizontal
    // scroll, and iPhone laid the document out at 548px and zoomed the type
    // down to fit. `overflow-x-auto` did NOT contain it. The table now
    // shrinks to fit instead, via tighter cell padding and type below
    // kx-md; `overflow-x-auto` stays purely as a safety net for anything
    // narrower than the layout anticipates.
    <div className="overflow-x-auto rounded-[14px] border border-border bg-surface">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="w-[34%] px-3 py-3 font-mono text-[10px] font-medium uppercase tracking-[.14em] text-muted kx-md:w-[40%] kx-md:px-6 kx-md:py-4 kx-md:text-[11px]">
              Compare plans
            </th>
            {tiers.map((tier) => (
              <th key={tier.name} className="px-2 py-3 kx-md:px-6 kx-md:py-4">
                <div
                  className={cn(
                    "font-display text-[14px] font-bold kx-md:text-[17px]",
                    tier.popular ? "text-accent-light" : "text-ink",
                  )}
                >
                  {tier.name}
                </div>
                <div className="mt-0.5 text-[12px] font-medium text-muted kx-md:text-[13px]">
                  ${tier.price}
                  <span>/mo</span>
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
                className="border-t border-border bg-light-canvas px-3 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[.14em] text-ink-3 kx-md:px-6 kx-md:py-[10px] kx-md:text-[11px]"
              >
                {group.heading}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <td className="border-t border-divider px-3 py-3 text-[13px] text-ink-2 text-pretty kx-md:px-6 kx-md:py-[13px] kx-md:text-[15px]">
                  {row.label}
                </td>
                {row.values.map((value, i) => (
                  <td
                    key={tiers[i]?.name ?? i}
                    className="border-t border-divider px-2 py-3 text-[13px] text-ink-2 kx-md:px-6 kx-md:py-[13px] kx-md:text-[15px]"
                  >
                    {value === "yes" ? (
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
                    ) : value === "no" ? (
                      <>
                        <span aria-hidden="true" className="text-muted">
                          &ndash;
                        </span>
                        <span className="sr-only">Not included</span>
                      </>
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
