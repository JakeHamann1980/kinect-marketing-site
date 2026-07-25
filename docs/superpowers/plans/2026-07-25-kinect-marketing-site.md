# KINECT Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production KINECT marketing site (home + three persona subdomains) from the high-fidelity handoff, with Sanity CMS, Supabase waitlist, consent-gated PostHog, and the research-driven SEO/AEO layer.

**Architecture:** One Next.js App Router app on one Vercel project serving four hostnames via middleware rewrites. Pages statically generated from Sanity content (seeded from typed local content files that hold the final handoff copy). Persona theming via a `data-persona` attribute switching CSS variables.

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Tailwind v4, Sanity v3 + next-sanity, Supabase (waitlist), Resend (confirmation email), PostHog (consent-gated), Playwright + Vitest.

**Authoritative design sources** (never guess a value; look it up):
- `design-reference/README.md` — every exact color, size, timing, and behavior. Section names in this plan match its headings.
- `design-reference/KINECT Marketing Site.html` — self-contained clickable reference. Open it in a browser next to the dev server for every visual task.

**Hard copy/design constraints (apply to every task):** no em dashes anywhere in site copy; card headers and section titles in Title Case; `text-wrap: balance` on headlines, `pretty` on body; no hard `<br>`; all decorative motion gated behind `prefers-reduced-motion: reduce`; never `overflow-x: hidden` on any ancestor of the nav (use `clip`); never a `background` shorthand on the element carrying the grid pattern.

---

## Phase A — Foundation

### Task 1: Move Design Reference, Scaffold Next.js

**Files:**
- Create: `design-reference/` (moved handoff files), Next.js scaffold at repo root, `.gitignore`
- Modify: none

- [ ] **Step 1: Move handoff files into `design-reference/`**

```bash
mkdir design-reference
mv "KINECT Marketing Site.dc.html" "KINECT Marketing Site.html" support.js image-slot.js README.md design-reference/
mv assets design-reference/assets
```

- [ ] **Step 2: Scaffold Next.js into the repo root**

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --no-turbopack
```

If it complains the directory is non-empty, scaffold into `tmp-scaffold`, then `rsync -a tmp-scaffold/ . && rm -rf tmp-scaffold` (verify `package.json` landed at root).

- [ ] **Step 3: Copy screenshots into `public/`**

```bash
mkdir -p public/screenshots
cp design-reference/assets/*.png public/screenshots/
```

- [ ] **Step 4: Verify dev server boots**

Run: `npm run dev` → expect `Ready` and default page at `http://localhost:3000`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app, move design reference"
```

### Task 2: Design Tokens and Fonts

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/lib/fonts.ts`

- [ ] **Step 1: Install fonts via next/font/google** (self-hosted at build time automatically)

`src/lib/fonts.ts`:
```ts
import { Hanken_Grotesk, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";

export const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-display" });
export const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
export const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
```

In `src/app/layout.tsx`, apply `${hanken.variable} ${instrument.variable} ${plexMono.variable}` to `<html>` and set `<body>` base: `background: var(--dark-bg); color: var(--on-dark); font-family: var(--font-sans);`.

- [ ] **Step 2: Write the token layer in `globals.css`** — transcribe the ENTIRE "Design Tokens" section of `design-reference/README.md` verbatim into CSS custom properties on `:root`:

```css
@import "tailwindcss";

:root {
  --dark-bg: #05070C; --dark-canvas: #070B12; --dark-panel: #0B1017; --dropdown-bg: #0E141F;
  --light-canvas: #F5F7FA; --surface: #FFFFFF; --border: #E4E9F0; --divider: #F0F3F7;
  --on-dark: #EEF2F8; --on-dark-2: #C7CEDA; --on-dark-3: #A2ABBC; --on-dark-4: #8B95A7; --on-dark-5: #5A6478;
  --ink: #0C1220; --ink-2: #3B4658; --ink-3: #5A6577; --muted: #96A0B2;
  --cyan: #35D6E8; --amber: #F0913A; --coral: #EC5242; --violet: #C7A0C0;
  --cyan-light: #0E93AC; --coral-light: #C4501F; --violet-light: #6E5AA8;
  --rule-strong: rgba(255,255,255,.22); --rule: rgba(255,255,255,.16); --rule-soft: rgba(255,255,255,.12);
  --rule-faint: rgba(255,255,255,.09); --rule-ghost: rgba(255,255,255,.06);
  --grid-line: rgba(255,255,255,.016); --grid-dot: rgba(255,255,255,.05);
  --text-gradient: linear-gradient(95deg, #F5A15A, #EC5242 45%, #35D6E8);
  --cta-gradient: linear-gradient(135deg, #F0913A, #EC5242);
  /* persona accent, switched by data-persona (Task 3) */
  --accent: var(--cyan); --accent-light: var(--cyan-light); --accent-tint: rgba(14,147,172,.12);
}
.kx-grad { background: var(--text-gradient); -webkit-background-clip: text; background-clip: text; color: transparent; }
@media print { .kx-grad { color: #EC5242; } }
```

Also add an `@theme inline` block mapping these to Tailwind color names (`--color-ink: var(--ink);` etc.) so utilities like `text-ink` work.

- [ ] **Step 3: Verify** — render swatches on the default page temporarily; run `npm run dev`; confirm fonts load (inspect computed `font-family` on a headline = Hanken Grotesk).

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: design tokens and self-hosted fonts"`

### Task 3: Persona Config

**Files:**
- Create: `src/lib/personas.ts`, `src/lib/personas.test.ts`, persona CSS in `globals.css`

- [ ] **Step 1: Write failing test** (`npx vitest` — install first: `npm i -D vitest`)

```ts
import { describe, it, expect } from "vitest";
import { PERSONAS, personaFromHost } from "./personas";

describe("personaFromHost", () => {
  it("maps subdomains to personas", () => {
    expect(personaFromHost("agency.kinectapp.ai")).toBe("agency");
    expect(personaFromHost("coach.kinectapp.ai")).toBe("coach");
    expect(personaFromHost("consultant.kinectapp.ai")).toBe("consultant");
  });
  it("maps root and unknown hosts to null (home)", () => {
    expect(personaFromHost("kinectapp.ai")).toBeNull();
    expect(personaFromHost("www.kinectapp.ai")).toBeNull();
    expect(personaFromHost("localhost:3000")).toBeNull();
  });
  it("supports *.localhost for dev", () => {
    expect(personaFromHost("coach.localhost:3000")).toBe("coach");
  });
  it("has config for all personas", () => {
    for (const p of ["agency", "coach", "consultant"] as const)
      expect(PERSONAS[p].accent).toMatch(/^#/);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/lib/personas.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement `src/lib/personas.ts`**

```ts
export type Persona = "agency" | "coach" | "consultant";
export const PERSONA_IDS = ["agency", "coach", "consultant"] as const;

export const PERSONAS: Record<Persona, {
  name: string; accent: string; accentLight: string; tint: string;
  hostname: string; dotClass: string;
}> = {
  agency:     { name: "Agency",     accent: "#35D6E8", accentLight: "#0E93AC", tint: "rgba(14,147,172,.12)",  hostname: "agency.kinectapp.ai",     dotClass: "bg-[#35D6E8]" },
  coach:      { name: "Coach",      accent: "#F0913A", accentLight: "#C4501F", tint: "rgba(240,145,58,.16)",  hostname: "coach.kinectapp.ai",      dotClass: "bg-[#F0913A]" },
  consultant: { name: "Consultant", accent: "#C7A0C0", accentLight: "#6E5AA8", tint: "rgba(139,120,192,.18)", hostname: "consultant.kinectapp.ai", dotClass: "bg-[#C7A0C0]" },
};

export function personaFromHost(host: string): Persona | null {
  const sub = host.split(":")[0].split(".")[0];
  return (PERSONA_IDS as readonly string[]).includes(sub) ? (sub as Persona) : null;
}
```

Add to `globals.css`:
```css
[data-persona="agency"]     { --accent: #35D6E8; --accent-light: #0E93AC; --accent-tint: rgba(14,147,172,.12); }
[data-persona="coach"]      { --accent: #F0913A; --accent-light: #C4501F; --accent-tint: rgba(240,145,58,.16); }
[data-persona="consultant"] { --accent: #C7A0C0; --accent-light: #6E5AA8; --accent-tint: rgba(139,120,192,.18); }
```

- [ ] **Step 4: Run tests** — `npx vitest run` → PASS. Add `"test": "vitest run"` to package.json scripts.

- [ ] **Step 5: Commit** — `git commit -am "feat: persona config and host resolution"`

## Phase B — Routing

### Task 4: Hostname Middleware

**Files:**
- Create: `src/middleware.ts`
- Test: covered by `personaFromHost` unit tests + Playwright in Task 19

- [ ] **Step 1: Implement `src/middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { personaFromHost, PERSONA_IDS } from "@/lib/personas";

const PROD_ROOT = "kinectapp.ai";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;
  const persona = personaFromHost(host);

  // Subdomain → internal persona route
  if (persona) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${persona}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next(); // shared routes (legal, api) serve as-is
  }

  // Root domain: canonicalize path access to the subdomain in production only
  const seg = pathname.split("/")[1];
  if (host === PROD_ROOT && (PERSONA_IDS as readonly string[]).includes(seg)) {
    return NextResponse.redirect(`https://${seg}.${PROD_ROOT}/`, 308);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|screenshots|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)"] };
```

- [ ] **Step 2: Manual verify** — with placeholder pages `src/app/agency/page.tsx` etc. (create trivial `<h1>` stubs for now), `curl -H "Host: coach.localhost:3000" http://localhost:3000/` returns the coach stub; `http://localhost:3000/agency` serves directly (no redirect in dev).

- [ ] **Step 3: Commit** — `git commit -am "feat: hostname middleware with persona rewrites and canonical redirects"`

## Phase C — Content Layer (local, typed; becomes the Sanity seed)

### Task 5: Content Types and Handoff Copy Transcription

**Files:**
- Create: `src/content/types.ts`, `src/content/home.ts`, `src/content/agency.ts`, `src/content/coach.ts`, `src/content/consultant.ts`, `src/content/settings.ts`

- [ ] **Step 1: Define `src/content/types.ts`**

```ts
import type { Persona } from "@/lib/personas";

export interface Faq { question: string; answer: string; }
export interface Card { title: string; body: string; features?: string[]; }
export interface Step { number: string; title: string; body: string; }
export interface Tier { name: string; price: number; popular?: boolean; features: string[]; cta: string; }
export interface Seo { title: string; description: string; }

export interface PersonaPageContent {
  persona: Persona; seo: Seo;
  hero: { headline: string; gradientPhrase: string; subhead: string; primaryCta: string; secondaryCta: string };
  capabilities: { title: string; intro: string; cards: Card[] };
  screenshot: { src: string; alt: string };
  workflow: { title: string; items: Card[] };
  faq: Faq[];
  closing: { headline: string; gradientPhrase: string; subhead: string };
}

export interface HomeContent {
  seo: Seo;
  hero: PersonaPageContent["hero"];
  personaCards: (Card & { persona: Persona; cta: string })[];
  steps: Step[];
  showcase: { labels: Record<Persona, string> };
  pillars: Card[];
  faq: Faq[];
  closing: PersonaPageContent["closing"];
}

export interface SiteSettings {
  navLinks: { label: string; href: string }[];
  solutions: { persona: Persona; name: string; description: string }[];
  pricing: { headline: string; supporting: string; tiers: Tier[] };
  footer: { positioning: string; columns: { heading: string; links: { label: string; href: string }[] }[] };
}
```

- [ ] **Step 2: Transcribe ALL copy from the reference** — open `design-reference/KINECT Marketing Site.html` in a browser, page-switch through all four pages, and transcribe every headline, subhead, card, step, FAQ, tier feature list, and footer link **verbatim** into the five content files. This is transcription, not writing. Pricing headline is exactly "Priced like a tool, not a tax" (single line). Tiers: Starter 149, Growth 399 (popular), Scale 799.

- [ ] **Step 3: Write a copy-constraint test** `src/content/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { home } from "./home"; import { agency } from "./agency";
import { coach } from "./coach"; import { consultant } from "./consultant";
import { settings } from "./settings";

const allText = JSON.stringify([home, agency, coach, consultant, settings]);
describe("copy constraints", () => {
  it("contains no em dashes", () => { expect(allText).not.toMatch(/—/); });
  it("contains no exclamation points in copy", () => { expect(allText).not.toMatch(/!(?!=)/); });
});
```

- [ ] **Step 4: Run** — `npx vitest run` → PASS (fix any transcription that trips it; the source copy is em-dash-free by design).

- [ ] **Step 5: Commit** — `git commit -am "feat: typed content layer with transcribed handoff copy"`

## Phase D — Components (each verified against the reference HTML side-by-side)

Component tasks share this loop: build → open `localhost:3000` beside `design-reference/KINECT Marketing Site.html` → match layout/spacing/typography to the README values → commit. Exact values live in the README sections named below; do not improvise any.

### Task 6: Logo Lockup, Buttons, Section Primitives

**Files:** Create `src/components/Lockup.tsx`, `src/components/Button.tsx`, `src/components/Eyebrow.tsx`, `src/components/SectionHead.tsx`

- [ ] Build the asterisk mark as inline SVG (32×32 viewBox, four `stroke-width:3` round-capped lines: vertical, horizontal, two diagonals), colored `var(--accent)`; lockup per README "Assets → Logo" (mark 25px, 1px×19px divider `--rule-strong`, wordmark Hanken 700 16px `.16em` tracking `#EEF2F8`). Solid fills only.
- [ ] Button variants: `primary` (`bg-[#EEF2F8] text-[#0B0F17] rounded-[10px] px-5 py-[11px] text-[15px] font-semibold`), `ghost` (`border border-[rgba(255,255,255,.18)] text-[#EEF2F8]`), `accent` (solid `var(--accent-light)` on light sections).
- [ ] `Eyebrow` = mono 11px uppercase `.14em` tracking `--on-dark-5`/`--muted`; `SectionHead` = Hanken 700 38px/1.14 with `text-wrap: balance` (27px @860, 24px @480).
- [ ] Commit: `git commit -am "feat: lockup, buttons, section primitives"`

### Task 7: Sticky Nav + Solutions Dropdown + Mobile Sheet

**Files:** Create `src/components/Nav.tsx` (client), `src/hooks/useStuck.ts`

- [ ] **Step 1: `useStuck` hook** — IntersectionObserver on a 1px sentinel:

```ts
"use client";
import { useEffect, useRef, useState } from "react";
export function useStuck() {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { sentinelRef, stuck };
}
```

- [ ] **Step 2: Nav structure** exactly per README "Sticky transparent nav": `<span ref={sentinelRef} style={{display:"block",height:1}}/>` then sticky wrapper `top-0 z-40`; nav padding `22px 60px`; transparent → `.kx-stuck` (`rgba(11,15,23,.82)` + `backdrop-blur(14px)` + hairline border-bottom, `.25s ease` transition). Links: Solutions (dropdown), Product, Pricing, Docs; CTA "Start free". CRITICAL: no ancestor may set `overflow-x: hidden`; the root layout uses `overflow-x: clip`.
- [ ] **Step 3: Solutions dropdown** per README: opens on hover AND focus (use `focus-within`), panel `#0E141F`, radius 14, shadow `0 24px 60px rgba(0,0,0,.5)`, ~300px; rows = 8px accent dot + name (15px/600) + one-line description (12.5px `#8B95A7`), navigating to persona hostnames (dev: paths).
- [ ] **Step 4: Mobile sheet** below 860px per README "Mobile menu": hamburger 42×42; full-width sheet, personas with dots then links, rows `min-h-[52px]` with `--rule-faint`-style dividers, full-width "Start free"; navigation closes it.
- [ ] **Step 5:** Verify against reference at desktop + 800px width, then commit: `git commit -am "feat: sticky nav, solutions dropdown, mobile sheet"`

### Task 8: Hero Background (Grid, Orbs, Traces)

**Files:** Create `src/components/HeroBackdrop.tsx`, CSS in `globals.css`

- [ ] **Step 1: Grid + dots** — transcribe from README "Hero → Background layer 1" EXACTLY:

```css
.kx-grid {
  background-color: var(--dark-canvas);
  background-image:
    radial-gradient(var(--grid-dot) 1px, transparent 1.6px),
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 312px 312px, 104px 104px, 104px 104px;
  background-position: -156px -52px, 0 0, 0 0;
}
```

Never set `background` shorthand on this element (documented prototype bug). Verify dots sit ON grid intersections and the top row has no dots.

- [ ] **Step 2: Orbs** — two absolutely-positioned radial-gradient divs (warm amber/coral one side, cyan the other), `z-index:-1`, keyframed scale+opacity breathing at ~18s and ~23s with offset delays.
- [ ] **Step 3: Traces** — six 1px lines (3 horizontal, 3 vertical) aligned to grid lines, `linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)`, translating across on 23–41s durations with staggered negative delays and varied lengths. Acceptance: "almost subliminal; if you notice them, they are too strong."
- [ ] **Step 4: Reduced motion** — wrap ALL orb/trace animation:

```css
@media (prefers-reduced-motion: reduce) {
  .kx-orb, .kx-trace { animation: none !important; }
}
```

- [ ] **Step 5:** Compare against reference hero at rest for 60 seconds; commit `git commit -am "feat: hero backdrop with grid, orbs, trace lines"`.

### Task 9: FAQ Accordion

**Files:** Create `src/components/Faq.tsx` (client), `src/components/Faq.test.tsx`

- [ ] **Step 1: Failing test** (install `@testing-library/react`, `jsdom`; set vitest `environment: "jsdom"`):

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Faq } from "./Faq";
const items = [
  { question: "Q1", answer: "A1" }, { question: "Q2", answer: "A2" },
];
it("opens one answer at a time", () => {
  render(<Faq items={items} />);
  fireEvent.click(screen.getByRole("button", { name: /Q1/ }));
  expect(screen.getByText("A1")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /Q2/ }));
  expect(screen.queryByText("A1")).not.toBeVisible();
  expect(screen.getByText("A2")).toBeVisible();
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement: single `openIndex` state; rows `border border-[#E4E9F0] rounded-[12px]`; question button `min-h-[56px]` 17px/600 left-aligned with 30px circular `＋` that inverts (`bg-[#EEF2F8]`, rotated) when open; answer 16px `#5A6577`. Use `aria-expanded` + `hidden` attribute for the closed panel.
- [ ] **Step 4:** `npx vitest run` → PASS. **Step 5:** Commit `git commit -am "feat: FAQ accordion"`.

### Task 10: Screenshot Cycler

**Files:** Create `src/components/ShowcaseCycler.tsx` (client), `src/lib/cycler.ts`, `src/lib/cycler.test.ts`

- [ ] **Step 1: TDD the state logic** in `src/lib/cycler.ts` as a pure reducer:

```ts
export type CyclerState = { pinned: number | null };
export function clickLabel(s: CyclerState, i: number): CyclerState {
  return s.pinned === i ? { pinned: null } : { pinned: i };
}
```

Test: clicking a label pins it; clicking the pinned label unpins (resumes auto-cycle); clicking another label re-pins. Run → FAIL → implement → PASS.

- [ ] **Step 2: Component** — three stacked `next/image`s (`/screenshots/portal-board.png`, `coach-hq.png`, `consultant-hq.png`) each with the README keyframe (`0,26% {opacity:1} 33%,93% {opacity:0} 100% {opacity:1}`, 15s, offsets 0/-5s/-10s). When `pinned !== null`: set `animation-play-state: paused` on all layers and force the pinned layer `opacity:1` via a `.pinned` class. Labels are pill buttons with parallel color sync (`#EEF2F8` active / `#5A6478` inactive).
- [ ] **Step 3: Frame + glow** per README "Product showcase": frame `border rgba(255,255,255,.16)` radius 14 `overflow-hidden` shadow `0 26px 70px rgba(0,0,0,.55)` + cyan rim; glow pool behind (`inset:-30px -18px -12px`, heavy blur, blue-dominant over orange), slow pulse, reduced-motion gated.
- [ ] **Step 4:** Verify 15s loop timing and pin/resume by hand; commit `git commit -am "feat: screenshot showcase cycler with pinnable labels"`.

### Task 11: Cards, Pricing, Steps, Pillars, Footer

**Files:** Create `src/components/PersonaCard.tsx`, `src/components/PricingSection.tsx`, `src/components/StepCards.tsx`, `src/components/PillarCards.tsx`, `src/components/Footer.tsx`

- [ ] Persona/feature/pricing cards per README §3/§6/§7: white cards `border #E4E9F0` radius 18 padding `32px 30px` shadow `0 1px 3px rgba(12,18,32,.05)`; 52px icon tiles in persona tint; Growth tier gets accent border + glow `0 8px 24px rgba(41,169,224,.14)`.
- [ ] Step cards per §4: quiet outlined cards (`border rgba(255,255,255,.1)`, `bg rgba(255,255,255,.03)`, radius 14, mono step numbers).
- [ ] Footer per README "Footer": `76px 60px 32px`, brand block + four link columns (from `settings.footer`), 34px social icon squares (X, LinkedIn, Instagram, YouTube inline SVGs), bottom legal bar linking `/legal/privacy`, `/legal/terms`, `/legal/security`, and Cookie Preferences (opens consent panel, Task 15).
- [ ] Commit: `git commit -am "feat: cards, pricing, steps, pillars, footer"`

## Phase E — Pages

### Task 12: Home Page

**Files:** Create `src/app/(site)/page.tsx`, `src/app/(site)/layout.tsx`; Delete placeholder stubs from Task 4 as they're replaced

- [ ] Assemble the nine home sections in order from `content/home.ts` + `content/settings.ts`, per README "Home Page": Hero (152px top pad, 78px asterisk badge circle, 66px headline with `.kx-grad` phrase, CTAs; NO product screenshot in hero) → logo strip placeholder (render `null` until logos exist; keep the component) → "Pick your lane" (light `#F5F7FA`, 124px pad) → How It Works (dark) → Showcase (cycler) → Pillars (light) → Pricing (light) → FAQ (light) → Closing CTA (dark, `.kx-grid` again, 52px headline).
- [ ] Root layout body uses `overflow-x: clip` and `data-persona` unset (home defaults to cyan accent).
- [ ] Verify side-by-side against reference home at 1280px, 800px, 400px. Commit: `git commit -am "feat: home page"`.

### Task 13: Persona Page Template + Three Pages

**Files:** Create `src/components/PersonaPage.tsx`, `src/app/(site)/[persona]/page.tsx`

- [ ] `PersonaPage` renders the shared section order (README "Persona Subdomain Pages"): hero → "Built for the way you work" capability grid → static framed screenshot (same glow, no cycler) → workflow → pricing (shared) → FAQ → closing. Root element sets `data-persona={persona}`.
- [ ] Route: `generateStaticParams` returns the three personas; unknown params → `notFound()`.

```tsx
export function generateStaticParams() {
  return [{ persona: "agency" }, { persona: "coach" }, { persona: "consultant" }];
}
```

- [ ] Verify all three against the reference (accent shifts in mark, gradient phrase, dropdown dot). Commit: `git commit -am "feat: persona pages"`.

### Task 14: Legal Pages

**Files:** Create `src/app/(site)/legal/[slug]/page.tsx`, `src/content/legal/privacy.ts`, `terms.ts`, `security.ts`, `cookies.ts`

- [ ] Draft REAL copy for Privacy Policy, Terms and Conditions, Security, and Cookie Policy describing actual practices: waitlist email + persona + UTM stored in Supabase; confirmation email via Resend; consent-gated PostHog analytics (reverse-proxied); Vercel hosting/analytics; contact address placeholder `[COMPANY LEGAL NAME AND ADDRESS]` clearly marked as the ONLY permitted placeholder (founder must fill; legal review required before launch — state this in a comment at the top of each file).
- [ ] Light-theme prose template: max-width 68ch, 17px body, Hanken headings, breadcrumb back to home.
- [ ] Commit: `git commit -am "feat: legal pages with drafted policy copy"`

## Phase F — Waitlist, Consent, Analytics

### Task 15: Consent Banner + PostHog

**Files:** Create `src/components/ConsentBanner.tssx` → `src/components/ConsentBanner.tsx`, `src/lib/consent.ts`, `src/lib/analytics.ts`, `src/components/PostHogProvider.tsx`; Modify `next.config.ts` (proxy rewrites), `src/app/(site)/layout.tsx`

- [ ] **Step 1:** `npm i posthog-js`. Add reverse-proxy rewrites in `next.config.ts`:

```ts
async rewrites() {
  return [
    { source: "/ph/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
    { source: "/ph/:path*", destination: "https://us.i.posthog.com/:path*" },
  ];
}
```

- [ ] **Step 2:** `src/lib/consent.ts` — TDD a tiny store: `getConsent(): "granted" | "denied" | null` from `localStorage("kx-consent")`, `setConsent(v)` dispatching a `kx-consent` CustomEvent. Test with vitest/jsdom.
- [ ] **Step 3:** `PostHogProvider` (client): initialize only when consent is granted —

```ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ph", ui_host: "https://us.posthog.com",
  persistence: "localStorage+cookie", capture_pageview: true,
});
```

On `denied`/`null`: do not init. On consent change to granted: init then `posthog.capture("consent_updated", { granted: true })`.
- [ ] **Step 4:** `src/lib/analytics.ts` — one typed `track(event, props)` wrapper implementing the spec §6 event taxonomy (no-ops when not initialized); every call merges `{ persona, ...firstTouchUtms() }` where `firstTouchUtms` reads UTM params once and persists to localStorage.
- [ ] **Step 5:** ConsentBanner: fixed bottom card (dark panel styling, Accept / Decline, link to `/legal/cookies`); footer "Cookie Preferences" reopens it. Instrument existing components: `cta_clicked` (Button gets `location` prop), `persona_card_clicked`, `solutions_nav_clicked`, `screenshot_pinned`, `faq_opened`, `pricing_tier_clicked`.
- [ ] **Step 6:** Verify: no `/ph/` network requests before consent; events flow after accepting. Commit: `git commit -am "feat: consent-gated PostHog analytics with event taxonomy"`.

### Task 16: Waitlist (Supabase + Resend)

**Files:** Create `supabase/migrations/0001_waitlist.sql`, `src/app/actions/waitlist.ts`, `src/components/WaitlistDialog.tsx`, `src/app/actions/waitlist.test.ts`, `.env.example`

- [ ] **Step 1: Migration** (apply via Supabase MCP `apply_migration` or CLI):

```sql
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  persona text,
  source_path text,
  utm jsonb,
  created_at timestamptz not null default now()
);
alter table waitlist_signups enable row level security;
-- no public policies: writes go through the server action with the service role key
```

- [ ] **Step 2: TDD the validation** — extract `parseWaitlistInput(formData)` pure function; tests: rejects bad email, rejects filled honeypot field `company`, rejects submissions faster than 2s after `renderedAt`, accepts valid input. Run FAIL → implement → PASS.
- [ ] **Step 3: Server action** `src/app/actions/waitlist.ts` (`"use server"`): validate → insert via `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` → on unique-violation return `{ ok: true, already: true }` → send Resend confirmation (`npm i resend`; from `hello@kinectapp.ai`, plain-text on-voice confirmation, no em dashes) → return `{ ok: true }`. Never expose service key client-side.
- [ ] **Step 4: Dialog** — accessible modal opened by every "Start free" (single config: `src/lib/cta.ts` exporting `CTA_MODE: "waitlist" | "signup-url"`); email field + honeypot (`className="hidden"` + `tabIndex={-1}` + `autoComplete="off"`) + hidden `renderedAt`; success state on-voice ("You are on the list."). Fires `waitlist_opened` / `waitlist_submitted`.
- [ ] **Step 5:** `.env.example` with `NEXT_PUBLIC_POSTHOG_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`. Verify a real submission end-to-end in dev. Commit: `git commit -am "feat: waitlist with Supabase storage and Resend confirmation"`.

## Phase G — Sanity CMS

### Task 17: Sanity Schemas + Studio

**Files:** Create `sanity/` (embedded studio config), `sanity/schemas/*.ts`, `src/app/studio/[[...tool]]/page.tsx`

- [ ] `npm i sanity next-sanity @sanity/vision && npx sanity init --env` (user must be logged into Sanity; creates project — record `NEXT_PUBLIC_SANITY_PROJECT_ID`, dataset `production`).
- [ ] Schemas mirroring `src/content/types.ts` exactly: `homePage` (singleton), `personaPage` (one per persona, `persona` string field), `siteSettings` (singleton), `legalPage` (slug + Portable Text body), shared object types `faq`, `card`, `tier`, `seo` (title, description, ogTitle, ogDescription). Studio mounted at `/studio` (exclude from middleware matcher: add `studio` to the negative lookahead).
- [ ] Commit: `git commit -am "feat: Sanity studio and schemas"`

### Task 18: Seed Script + Page Wiring + Revalidation

**Files:** Create `scripts/seed-sanity.ts`, `src/lib/sanity.ts` (client + GROQ queries), `src/app/api/revalidate/route.ts`; Modify page components to fetch from Sanity

- [ ] **Step 1: Seed script** — maps the `src/content/*.ts` objects to Sanity documents via `@sanity/client` with a write token (`SANITY_WRITE_TOKEN`), using `createOrReplace` with stable `_id`s (`homePage`, `personaPage-agency`, etc.). Run: `npx tsx scripts/seed-sanity.ts`. Verify documents in Studio.
- [ ] **Step 2: Queries** in `src/lib/sanity.ts` returning the SAME TypeScript types as `src/content/types.ts` (the content files remain the type source of truth and the seed source; pages stop importing them directly). Use `sanityFetch` with `next: { tags: ["content"] }`.
- [ ] **Step 3: Revalidation webhook** `src/app/api/revalidate/route.ts`: verify `SANITY_REVALIDATE_SECRET` signature, `revalidateTag("content")`. Configure the webhook in Sanity manage UI (document in README).
- [ ] **Step 4:** Pages now `await` Sanity data at build; `npm run build` succeeds fully static (except api routes). Edit a headline in Studio → webhook → page updates. Commit: `git commit -am "feat: pages served from Sanity with seed script and revalidation"`.

## Phase H — SEO, AEO, OG

### Task 19: Metadata, Robots, Sitemaps, Canonicals

**Files:** Create `src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/llms.txt`; Modify page files (`generateMetadata`)

- [ ] **Step 1:** `src/lib/seo.ts` — `pageMetadata(page)` building Next `Metadata` from Sanity seo fields with the spec §8a targets as the seeded values: Home title "KINECT | Client Portal Software Clients Actually Open"; Agency "Client Portal Software for Marketing & Creative Agencies | KINECT"; Coach "Client Check-In and Progress Portal for Fitness Coaches | KINECT"; Consultant "Client Portal for Consultants | KINECT". Every description = persona pain + flat-price hook (e.g. Agency: "A branded portal your clients actually open. Task boards, deliverables, and AI that explains the work. Flat pricing from $149 a month, no per-seat fees."). `alternates.canonical` = the persona's subdomain URL.
- [ ] **Step 2:** `robots.ts` — allow all, PLUS explicit allow blocks for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`; sitemap reference per-hostname. `sitemap.ts` emits only the current hostname's URLs (read host via `headers()` in a route handler variant if needed; simplest: one sitemap per hostname listing that hostname's pages).
- [ ] **Step 3:** `public/llms.txt` — one page: what KINECT is, three personas with subdomain URLs, flat pricing tiers, waitlist status.
- [ ] **Step 4:** Verify `curl localhost:3000/robots.txt`, `/sitemap.xml`, view-source metadata on each page. Commit: `git commit -am "feat: metadata, robots, sitemaps, llms.txt"`.

### Task 20: JSON-LD

**Files:** Create `src/components/JsonLd.tsx`, `src/lib/jsonld.ts`, `src/lib/jsonld.test.ts`

- [ ] **Step 1: TDD builders** in `src/lib/jsonld.ts`:

```ts
export function organizationLd(): object   // @id "https://kinectapp.ai/#org", sameAs: the three subdomain roots + social URLs from settings
export function softwareApplicationLd(): object
export function faqPageLd(faqs: Faq[]): object
```

Tests assert: `softwareApplicationLd()` contains `"@type":"SoftwareApplication"`, `applicationCategory:"BusinessApplication"`, and an `AggregateOffer` with `lowPrice: "149"`, `highPrice: "799"`, `offerCount: "3"`, `priceCurrency: "USD"` and three child Offers (Starter/Growth/Scale); `organizationLd()` `@id` is identical regardless of rendering hostname; `faqPageLd` maps question/answer pairs to `Question`/`Answer`. Run FAIL → implement → PASS.

- [ ] **Step 2:** `<JsonLd data={...}/>` renders `<script type="application/ld+json">` with `JSON.stringify`; mount Organization + WebSite + SoftwareApplication in the site layout, FAQPage on every page with FAQs.
- [ ] **Step 3: Validation gate** — `scripts/validate-jsonld.ts`: fetch each built page, extract ld+json blocks, `JSON.parse` each (broken-schema guard; a competitor ships a broken block today), assert required types present. Wire into `npm run build:check`. Also manually run key pages through Google's Rich Results Test before launch (checklist, Task 23).
- [ ] **Step 4:** Commit: `git commit -am "feat: structured data with validated AggregateOffer pricing"`.

### Task 21: OG Images + Preview Meta

**Files:** Create `src/app/og/route.tsx` (or per-page `opengraph-image.tsx`), `src/lib/og-template.tsx`

- [ ] **Step 1:** Edge `ImageResponse` template (1200×630): dark `#070B12` canvas, the grid pattern (approximate with an SVG background), lockup top-left, headline with the gradient phrase rendered via nested spans (background-clip unsupported in Satori: use per-word solid colors `#F5A15A`/`#EC5242`/`#35D6E8` stepping through the phrase), persona accent dot. Variants: home, per-persona (accent + persona name), generic (pricing/legal).
- [ ] **Step 2:** Wire `openGraph` + `twitter` metadata in `src/lib/seo.ts`: `summary_large_image`, absolute per-hostname URLs (`metadataBase` from request host), Sanity overrides respected.
- [ ] **Step 3:** Favicon/touch icons: export the asterisk mark as `icon.svg` + `apple-icon.png` (dark tile, cyan mark), `theme-color: #070B12`.
- [ ] **Step 4:** Verify `http://localhost:3000/og?page=agency` renders; check all four pages' OG tags in view-source. Commit: `git commit -am "feat: dynamic OG images and preview metadata"`.

## Phase I — Verification

### Task 22: Playwright Suite

**Files:** Create `playwright.config.ts`, `e2e/nav.spec.ts`, `e2e/interactions.spec.ts`, `e2e/waitlist.spec.ts`, `e2e/middleware.spec.ts`, `e2e/consent.spec.ts`, `e2e/motion.spec.ts`

- [ ] `npm i -D @playwright/test && npx playwright install chromium`. Config: baseURL `http://localhost:3000`, webServer `npm run dev`.
- [ ] Specs (write each, run, fix until green):
  - `nav`: nav transparent at top (`kx-stuck` absent), scroll 200px → stuck class + background; Solutions opens on hover and on keyboard focus; mobile (viewport 400×800) hamburger opens sheet, clicking a persona closes it.
  - `interactions`: FAQ opens one at a time; cycler label click pins (animation-play-state paused), second click resumes; pricing headline renders on a single line at 1280px (`boundingBox` height ≈ one line).
  - `waitlist`: open dialog, submit valid email against a mocked action (route intercept), success message shown; honeypot-filled submission rejected.
  - `middleware`: request with `Host: coach.localhost` header serves coach hero headline; `/agency` path serves agency page in dev.
  - `consent`: before accepting, no requests to `/ph/*` (`page.on("request")` assertion); after Accept, PostHog initializes.
  - `motion`: with `page.emulateMedia({ reducedMotion: "reduce" })`, computed `animation-name` on orb/trace/cycler elements is `none`.
- [ ] Responsive screenshot pass at 1280/1024/860/480 for all four pages (`npx playwright test --update-snapshots` once, eyeball against reference, keep as regression baseline).
- [ ] Commit: `git commit -am "test: Playwright coverage for nav, interactions, waitlist, consent, middleware, motion"`.

### Task 23: Launch Checklist (documented, partly founder-owned)

**Files:** Create `docs/LAUNCH.md`

- [ ] Write `docs/LAUNCH.md` enumerating, with owners:
  1. Vercel project + all four domains attached; env vars set (list from `.env.example`).
  2. Supabase migration applied in prod; Resend domain (`kinectapp.ai`) verified with SPF/DKIM.
  3. Sanity: production dataset seeded; revalidation webhook configured; Studio access for the team.
  4. PostHog: marketing project created; funnels + launch dashboard from spec §6 built; key in env.
  5. Search Console properties for all four hostnames; sitemaps submitted.
  6. Rich Results Test on all four pages; Slack/LinkedIn/X/iMessage preview validation.
  7. Lighthouse ≥ 90 performance on home + one persona page (throttled mobile).
  8. Legal copy reviewed by counsel; `[COMPANY LEGAL NAME AND ADDRESS]` placeholders filled.
  9. Real-device mobile pass (handoff flags this as never done).
  10. Founder off-site list started (G2/Capterra, entity cleanup) — reference spec §8a-iii.
- [ ] `npm run build && npm run test && npx playwright test` all green.
- [ ] Commit: `git commit -am "docs: launch checklist"`.

---

## Self-Review Notes (resolved during planning)

- Spec §8a-ii content roadmap (comparison pages, JTBD page) is explicitly post-launch; intentionally not in this plan.
- Task 15 filename typo corrected: `ConsentBanner.tsx`.
- The `[COMPANY LEGAL NAME AND ADDRESS]` placeholder in Task 14 is deliberate founder input, marked as such; no other placeholders exist.
- Type names used across tasks (`Persona`, `Faq`, `Card`, `Tier`, content types) all originate in Tasks 3 and 5 and are reused verbatim thereafter.
