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
    <div className="overflow-x-auto rounded-[14px] border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr>
            <th className="w-[40%] px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-muted">
              Compare plans
            </th>
            {tiers.map((tier) => (
              <th key={tier.name} className="px-6 py-4">
                <div
                  className={cn(
                    "font-display text-[17px] font-bold",
                    tier.popular ? "text-accent-light" : "text-ink",
                  )}
                >
                  {tier.name}
                </div>
                <div className="mt-0.5 text-[13px] font-medium text-muted">
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
                className="border-t border-border bg-light-canvas px-6 py-[10px] text-left font-mono text-[11px] font-medium uppercase tracking-[.14em] text-ink-3"
              >
                {group.heading}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <td className="border-t border-divider px-6 py-[13px] text-[15px] text-ink-2 text-pretty">
                  {row.label}
                </td>
                {row.values.map((value, i) => (
                  <td
                    key={tiers[i]?.name ?? i}
                    className="border-t border-divider px-6 py-[13px] text-[15px] text-ink-2"
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
