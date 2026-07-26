import type { Persona } from "@/lib/personas";

export interface Faq {
  question: string;
  answer: string;
}
export interface Card {
  title: string;
  body: string;
  features?: string[];
}
export interface Step {
  number: string;
  title: string;
  body: string;
}
export interface Tier {
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
  cta: string;
}
export interface Seo {
  title: string;
  description: string;
}

/**
 * The persona subdomain pages (agency, coach, consultant) carry more distinct
 * copy sections than the base contract anticipated. Rather than drop copy to
 * fit the original shape, the following fields extend `PersonaPageContent`:
 *
 * - `heroExtra`: the subdomain hero has a small eyebrow label above the
 *   headline and two "proof point" checkmarks below the CTAs that the home
 *   hero does not have. Kept separate from `hero` (rather than added to it)
 *   so the shared `hero` shape used by both `HomeContent` and
 *   `PersonaPageContent` doesn't force `home.ts` to fabricate values it has
 *   no source copy for.
 * - `pain`: a "name the pain" section (a sentence-shaped problem statement
 *   plus three cards) that precedes the capabilities section in the source
 *   and has no equivalent field in the original contract.
 * - `workflow`: modeled on the persona's "templates" section (an eyebrow, a
 *   headline, a supporting line, and a flat list of short template/program/
 *   engagement labels). `items` is `string[]` rather than `Card[]` because
 *   the source items are single short chips, not title+body pairs.
 * - `steps`: the persona-specific "Live in ten minutes, not ten days"
 *   4-step section, absent from the original contract.
 * - `closing.secondaryCta`: the closing section's second button ("Not you?
 *   Pick another lane") that routes back to the home persona picker; the
 *   original `closing` shape only had room for the headline pair and
 *   subhead.
 */
export interface PersonaPageContent {
  persona: Persona;
  seo: Seo;
  hero: {
    headline: string;
    gradientPhrase: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
  };
  heroExtra: { eyebrow: string; proofPoints: [string, string] };
  /**
   * The nav's small subdomain badge shown next to the wordmark on persona
   * pages (e.g. "for Agencies"). Home has no equivalent (its nav shows no
   * badge), so this lives on `PersonaPageContent` only.
   */
  navBadge: string;
  pain: { title: string; cards: Card[] };
  capabilities: { title: string; intro: string; cards: Card[] };
  screenshot: { src: string; alt: string; caption: string };
  workflow: { eyebrow: string; title: string; subhead: string; items: string[] };
  steps: { title: string; items: Step[] };
  faq: Faq[];
  closing: {
    headline: string;
    gradientPhrase: string;
    subhead: string;
    secondaryCta: string;
  };
}

/**
 * The home page also carries more sections than the base contract
 * anticipated (a logo strip eyebrow, a persona-selector section intro, a
 * steps-section headline, a showcase headline plus its five workflow
 * callouts, a pillars-section intro, a secondary "bento" block, and an FAQ
 * section title). These are additive extensions for the same reason as
 * above: transcription completeness without inventing copy.
 */
export interface HomeContent {
  seo: Seo;
  hero: PersonaPageContent["hero"];
  logoStrip: { eyebrow: string };
  personaSelector: { eyebrow: string; title: string; intro: string };
  personaCards: (Card & { persona: Persona; cta: string })[];
  stepsSection: { title: string; subhead: string };
  steps: Step[];
  showcase: {
    title: string;
    subhead: string;
    labels: Record<Persona, string>;
    /**
     * The three cross-fading screenshots ShowcaseCycler renders, one per
     * persona. `{ src, alt }` (no caption -- the cycler has no caption UI)
     * so the component's existing contract is unchanged whether `src`
     * comes from a dereferenced Sanity image asset or a local /screenshots
     * fallback path.
     */
    screenshots: Record<Persona, { src: string; alt: string }>;
    workflow: Card[];
  };
  pillarsSection: { title: string; intro: string };
  pillars: Card[];
  bento: {
    /** Same as `Card` plus the bento tile's product screenshot. */
    workVisible: Card & { image: { src: string; alt: string } };
    aiInsight: { eyebrow: string; quote: string };
    stat: { value: string; caption: string };
  };
  faqTitle: string;
  faq: Faq[];
  /**
   * Home's closing CTA ("Stop reporting on the work. Start showing it.")
   * has only the single primary button in the source; the "Not you? Pick
   * another lane" secondary button only makes sense on persona subdomain
   * pages routing back to the home persona picker. Home's closing therefore
   * omits `secondaryCta` rather than inheriting the full persona shape.
   */
  closing: Omit<PersonaPageContent["closing"], "secondaryCta">;
}

export interface SiteSettings {
  navLinks: { label: string; href: string }[];
  solutions: { persona: Persona; name: string; description: string }[];
  /**
   * `note` is the home pricing section's trailing line ("Every plan
   * includes the portal, analytics and AI insights. Pricing varies
   * slightly by lane."). It is transcribed verbatim for fidelity, but it
   * presumes per-lane pricing variation, which conflicts with the current
   * canonical single shared tier table described above (see the pricing
   * note in settings.ts). Whether/how this line renders is pending a
   * product decision, so the field is optional and flagged here rather
   * than wired into any component yet.
   */
  pricing: { headline: string; supporting: string; tiers: Tier[]; note?: string };
  footer: {
    positioning: string;
    columns: { heading: string; links: { label: string; href: string }[] }[];
    legalLinks: { label: string; href: string }[];
    copyright: string;
  };
}
