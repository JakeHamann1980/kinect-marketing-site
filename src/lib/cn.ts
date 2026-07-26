/** Joins class fragments. NOTE: additive only — Tailwind cascade order decides conflicts, so passing e.g. px-8 does not reliably override a component's px-5. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
