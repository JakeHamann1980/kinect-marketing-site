# Handoff: KINECT Marketing Site

## Overview

The public marketing site for KINECT, a client-portal SaaS sold to three personas. It is a **root domain with a persona selector plus three persona subdomains**:

| Page | Domain | Audience |
|---|---|---|
| Home | `kinectapp.ai` | Anyone; routes visitors to their lane |
| Agency | `agency.kinectapp.ai` | Marketing / creative agencies (primary) |
| Coach | `coach.kinectapp.ai` | Fitness coaches and trainers |
| Consultant | `consultant.kinectapp.ai` | Consultants and mentors |

All four pages live in a **single prototype file** (`KINECT Marketing Site.dc.html`) with an in-page page switcher, because that was the fastest way to design and review them together. **In production these are four routes** (or one templated route with three persona configs) across four hostnames. The nav "Solutions" dropdown and the home page's persona cards are the cross-links.

This package covers the marketing site only. The application is a separate handoff (`design_handoff_dashboard`) and should be built in its own session. They share design tokens and the logo lockup; nothing else.

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype demonstrating intended look, layout, copy, and motion. They are **not production code to copy**.

The `.dc.html` file is markup with inline styles plus a JavaScript class holding page state and derived values. That structure exists to make the prototype editable in a design tool. **Do not mirror it.** Recreate the design in the target stack using its own patterns.

For a marketing site, a static-site generator or framework with SSG/SSR is the right choice — Next.js, Astro, or similar — for SEO, per-subdomain routing, and Core Web Vitals. All content is currently hardcoded; decide early whether copy should move to a CMS.

The prototype also includes demo-only chrome (a fake browser frame, URL bar, and page tabs) used for presenting the design. **None of that ships** — it is behind toggles and must be omitted entirely in production.

## Fidelity

**High-fidelity.** Colors, typography, spacing, motion timings, and copy are final and intentional. Recreate faithfully. All values below are exact.

Copy has been through several editing passes for voice and tone — it is deliberate. Notably: **no em dashes anywhere** (a hard constraint; use commas, colons, or periods), card headers and section titles in **Title Case**, and normalized copy lengths so cards in a row align. Preserve all three.

---

## Voice & Tone

The audience is creatives and independent operators, so the writing is **clever and concrete, never corporate**. Rules observed throughout:

- Lead with what it does, not what it is. "Stop reporting on the work." beats "A unified client collaboration platform."
- Short sentences. Concrete nouns. No throat-clearing.
- Name the pain plainly ("Your client portal is a filing cabinet"), then the resolution.
- **No em dashes.** Recast the sentence instead.
- No exclamation points, no emoji, no "revolutionize / seamless / unlock / elevate."
- Headline lengths are tuned so lines break where intended; `text-wrap: balance` handles the rest.

Section headers are sentence-shaped statements; card titles are Title Case noun phrases.

---

## Global Elements

### Sticky transparent nav

The nav is **transparent over the hero on load** and gains a background only once the page scrolls.

Structure — a 1px sentinel above a sticky wrapper:

```
<span id="sentinel" style="display:block;height:1px"></span>
<div id="navwrap" style="position:sticky; top:0; z-index:40">
  <div id="nav">…</div>
</div>
```

An IntersectionObserver watches the sentinel; when it leaves the viewport, the nav gets a `kx-stuck` class:

```css
#kx-nav { background: transparent; border-bottom: 1px solid transparent;
          transition: background .25s ease, border-color .25s ease; }
#kx-nav.kx-stuck { background: rgba(11,15,23,.82);
                   backdrop-filter: blur(14px);
                   border-bottom-color: rgba(255,255,255,.09); }
```

Important implementation note: an ancestor with `overflow-x: hidden` **breaks `position: sticky`**. Use `overflow-x: clip` (or no clipping at all) on wrappers above the nav. This cost real debugging time in the prototype.

Nav contents, `padding:22px 60px`, `display:flex; align-items:center; gap:14px`:
- **Logo lockup** (left) — asterisk mark 25px in cyan `#35D6E8`, a 1px × 19px `rgba(255,255,255,.22)` divider, then wordmark "KINECT" in Hanken Grotesk 700, 16px, `letter-spacing:.16em`, `#EEF2F8`. Clicking returns home.
- **Link group** (`margin-left:auto`, gap 28px, 15px `#C7CEDA`) — **Solutions** (dropdown), Product, Pricing, Docs.
- **CTA** — "Start free", 15px/600, `color:#0B0F17`, `background:#EEF2F8`, `border-radius:10px`, `padding:11px 20px`.
- **Hamburger** (mobile only) — 42×42, `border:1px solid rgba(255,255,255,.16)`, `background:rgba(255,255,255,.04)`, `border-radius:11px`, three 18px white lines.

**Solutions dropdown** — opens on hover and focus. Panel: `background:#0E141F`, `border:1px solid rgba(255,255,255,.1)`, `border-radius:14px`, `box-shadow:0 24px 60px rgba(0,0,0,.5)`, width ~300px. One row per persona: an 8px accent dot (cyan / coral / violet), the persona name (15px/600 `#EEF2F8`), and a one-line description (12.5px `#8B95A7`) beneath. Rows navigate to the persona page.

**Mobile menu** — below 860px the link group hides and the hamburger reveals a full-width sheet (`background:#0E141F`, `border-bottom:1px solid rgba(255,255,255,.1)`, `padding:10px 20px 20px`) listing the three personas (with accent dots) then the nav links, each `min-height:52px` with a `rgba(255,255,255,.07)` divider, and a full-width "Start free" button at the bottom. Navigating closes the sheet.

### Footer

Dark, `padding:76px 60px 32px`, `border-top:1px solid rgba(255,255,255,.08)`.

- **Top row** (`display:flex; gap:72px; padding-bottom:52px`): a brand block (lockup, a one-line positioning statement, and the four social icon placeholders) and, pushed right, four link columns (Product / Solutions / Company / Resources) each with a mono 11px uppercase `#5A6478` heading and 14px `#8B95A7` links.
- **Social icons** — four 34px squares, `border:1px solid rgba(255,255,255,.12)`, `border-radius:9px`, containing X, LinkedIn, Instagram, and YouTube glyphs. Currently placeholders; wire to real profiles.
- **Bottom bar** (`padding-top:26px; border-top:1px solid rgba(255,255,255,.07)`): copyright (13px `#5A6478`) and, right-aligned, Privacy Policy, Terms and Conditions, Security, and Cookie Preferences.

Legal pages are linked but **not designed** — they need to exist before launch.

---

## Home Page (`kinectapp.ai`)

Sections alternate **dark and light** deliberately; that rhythm is the primary structural device and the main thing the reference imagery drove.

### 1. Hero (dark)

`padding:152px 60px 62px`, canvas `#070B12`, content centered and vertically centered in the space between the nav and the logo strip.

**Background, three layers:**

1. **Grid + dots** (`.kx-grid`) — a 104px grid of 1px `rgba(255,255,255,.016)` lines, plus a dot layer of `radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.6px)` on a 312px tile. Dots must land **exactly on grid intersections**, and the layer is offset (`background-position: 0 0, 0 0, -156px -52px`) so the **top row has no dots**. Getting the dots onto the corners rather than floating mid-square took several passes; keep the offsets.
   *Do not set a `background` shorthand on any element carrying `.kx-grid`* — it wipes the pattern. Use `background-color` only. This was a real bug.
2. **Orbs** — two large soft radial gradients (warm amber/coral on one side, cyan on the other) that breathe on independent slow cycles (scale and opacity, ~18s and ~23s, offset delays). They sit at `z-index:-1` behind content.
3. **Trace lines** — six barely-visible white lines (three horizontal, three vertical) that sweep along grid lines. `background: linear-gradient(90deg, transparent, rgba(255,255,255,.11–.13), transparent)`, 1px, on 23–41s durations with staggered negative delays and varied lengths so no two ever sync. These should read as *almost subliminal*; if you notice them, they are too strong.

All decorative animation must be disabled under `prefers-reduced-motion: reduce`.

**Content, centered:**
- **Asterisk badge** — a 78px circle, `background:#EEF2F8`, containing the mark in dark. Sits above the headline with no rule through it.
- **Headline** — Hanken Grotesk 700, 66px, `line-height:1.06`, `letter-spacing:-.02em`, `#EEF2F8`, `text-wrap:balance`, no hard `<br>`s. The gradient phrase uses `.kx-grad` (below).
- **Subhead** — 20px `#8B95A7`, `max-width:560px`, `line-height:1.6`, `text-wrap:pretty`.
- **CTA row** — primary "Start free" (`background:#EEF2F8`, `color:#0B0F17`) and a secondary ghost button (`border:1px solid rgba(255,255,255,.18)`, `color:#EEF2F8`). Gap 11px. On mobile they stack full width.

There is deliberately **no product screenshot in the hero** — it was tried and removed. The hero ends with the CTAs.

**Gradient text:**
```css
.kx-grad { background: linear-gradient(95deg, #F5A15A, #EC5242 45%, #35D6E8);
           -webkit-background-clip: text; background-clip: text; color: transparent; }
```
Provide a solid `#EC5242` fallback for print and any context where `background-clip:text` fails.

### 2. Customer logo strip (dark)

`padding:26px 60px 64px`, `border-bottom:1px solid rgba(255,255,255,.06)`. A mono 11px uppercase `#5A6478` eyebrow ("Built with agencies…"), then a row of **six logo slots** at 132×44, `object-fit:contain`, `opacity:.55`. Currently empty placeholders. Replace with real customer logos (SVG preferred), and remove the strip entirely until there are real logos to show.

### 3. Persona selector: "Pick your lane" (light)

`background:#F5F7FA`, `padding:124px 60px`. An intro row with the section title and a supporting paragraph beside it (`flex`, wrapping; `min-width` released on mobile).

Three cards, `repeat(3,1fr)`, gap 16px. Each: `background:#fff`, `border:1px solid #E4E9F0`, `border-radius:18px`, `padding:32px 30px`, `box-shadow:0 1px 3px rgba(12,18,32,.05)`. Contents:
- A 52px icon tile in the persona's light tint (agency `rgba(14,147,172,.12)`/`#0E93AC`, coach `rgba(240,145,58,.16)`/`#C4501F`, consultant `rgba(139,120,192,.18)`/`#6E5AA8`).
- Persona title (Hanken 700, 23px).
- Body copy (17px `#5A6577`, `line-height:1.6`) — lengths normalized so all three cards align.
- A short feature list.
- A **solid accent CTA button** at the bottom that navigates to that persona's subdomain.

### 4. How it works (dark)

Four **small outlined step cards** — deliberately quiet, not bold. `border:1px solid rgba(255,255,255,.1)`, `background:rgba(255,255,255,.03)`, `border-radius:14px`. Each has a mono step number, a Title Case heading, and one line of copy. They were toned down from an earlier heavier treatment.

### 5. Product showcase with cycling screenshots (dark)

The centerpiece. A single framed product screenshot that **cross-fades between the three persona dashboards** on a 15s loop, with the three labels beneath staying in sync.

- **Frame** — `border:1px solid rgba(255,255,255,.16)`, `border-radius:14px`, `overflow:hidden`, `box-shadow:0 26px 70px rgba(0,0,0,.55)` plus a cyan rim glow.
- **Glow** — a layered pool behind the frame (`inset:-30px -18px -12px`, heavy blur) that is **blue-dominant over orange**: a large cyan pool on the right, a warm coral secondary on the left, and a wide blue base wash. It pulses slowly.
- **Cycling** — three stacked images each running the same keyframe animation with 1/3 offsets: `0,26% { opacity:1 } 33%,93% { opacity:0 } 100% { opacity:1 }` over 15s. Labels use a parallel keyframe that shifts `color` between `#EEF2F8` (active) and `#5A6478` (inactive).
- **Labels are clickable** — each is a pill button. Clicking pins that persona's screenshot (animation pauses, label highlights); clicking the active one resumes the auto-cycle. Implement as real state, not CSS-only, so the pinned state is controllable.

Screenshots: `assets/portal-board.png` (agency), `assets/coach-hq.png`, `assets/consultant-hq.png` (see Assets).

### 6. Feature pillars (light)

Three or four cards describing the product's core value (a portal clients open, analytics built in, AI that explains). Same card treatment as the persona cards. Each leads with an icon tile; copy lengths are normalized.

### 7. Pricing (light)

Section headline **"Priced like a tool, not a tax"** on a single line (it was explicitly changed from a two-line break). Three tiers matching the app: **Starter $149**, **Growth $399** (most popular, accent border and glow), **Scale $799**. Each card lists included features and a CTA. Supporting line notes no per-seat and no per-feature pricing.

### 8. FAQ (light)

An accordion. Each row: `border:1px solid #E4E9F0`, `border-radius:12px`, a full-width question button (`min-height:56px`, 17px/600, left-aligned) with a 30px circular `＋` indicator on the right that inverts when open (`background:#EEF2F8`), and an answer panel (16px `#5A6577`, `line-height:1.6`) that expands. One open at a time.

### 9. Closing CTA (dark)

Matches the hero: same `#070B12` canvas, the same `.kx-grid` grid-and-dot pattern, and the same breathing orbs. Headline **"Stop reporting on the work. Start showing it."** in Hanken 700 52px with the gradient treatment; subhead at 17px on a single line (`white-space:nowrap`, `max-width:760px`); then the CTA pair.

---

## Persona Subdomain Pages

Each of the three (`agency`, `coach`, `consultant`) follows the **same section order**, with persona-specific copy, accent, and screenshot:

1. **Hero** — same structure as home (grid, orbs, traces, asterisk badge, headline, subhead, CTAs) but with persona-specific headline and the persona accent in the gradient phrase and dropdown dot.
2. **"Built for the way you work"** — a card grid of persona-specific capabilities. Copy lengths normalized so headers and body align across cards. (One coach card has a naturally short headline; that is fine, it was checked.)
3. **Product screenshot** — that persona's dashboard, statically framed with the same glow treatment.
4. **Workflow / features** — how the work actually flows for that persona.
5. **Pricing** — same three tiers, same single-line headline.
6. **FAQ** — persona-specific questions.
7. **Closing CTA** — same treatment as home.

Nav and footer are shared. The nav accent (mark color) and the gradient phrase color shift per persona:

| Persona | Accent (on dark) | Light tint |
|---|---|---|
| Agency | `#35D6E8` | `rgba(14,147,172,.12)` / `#0E93AC` |
| Coach | `#F0913A` | `rgba(240,145,58,.16)` / `#C4501F` |
| Consultant | `#C7A0C0` | `rgba(139,120,192,.18)` / `#6E5AA8` |

---

## Interactions & Behavior

| Interaction | Behavior |
|---|---|
| Scroll past hero | Nav gains blurred dark background + hairline border (IntersectionObserver on a 1px sentinel). |
| Solutions dropdown | Opens on hover and focus; rows navigate to persona pages. Becomes a static full-width block on mobile. |
| Hamburger (mobile) | Toggles the full-width sheet; any navigation closes it. |
| Persona card CTA | Navigates to that persona's page/subdomain. |
| Screenshot labels | Click pins a persona (pauses cycling); clicking the active label resumes. |
| Screenshot auto-cycle | 15s loop, three stages, labels synced. |
| FAQ row | Expands one answer at a time; `＋` indicator inverts. |
| Page navigation | Scrolls to top on change. |
| Hero orbs / traces | Continuous slow ambient motion; disabled under `prefers-reduced-motion`. |

### Responsive

Breakpoints at **1024px**, **860px**, **480px**.

- **≤1024px** — 4-column grids become 2; horizontal padding drops from 60px to 34px.
- **≤860px** — nav links collapse into the hamburger sheet; demo chrome (URL bar, page tabs) hides; hero padding `104px 20px 56px`; hero headline 66px → **34px**, subhead 20px → 17px; section heads 38px → 27px; all multi-column grids collapse to one; hero CTAs stack full width; `white-space:nowrap` and hard `<br>`s are released so nothing overflows; the footer stacks (brand block, then columns, then a stacked legal bar); logo slots shrink to 104×34; FAQ rows get `min-height:56px`.
- **≤480px** — hero headline 29px, section heads 24px, padding 16px.

Mobile behavior was audited but **not verified on real devices** — test before launch.

---

## State Management

The prototype's state is minimal and mostly presentational:

- `page` — `home` / `agency` / `coach` / `consultant`. **In production this is routing**, not state.
- `mobNavOpen` — hamburger sheet.
- `solOpen` — Solutions dropdown.
- `faqOpen` — index of the expanded FAQ row.
- `pinnedShot` — pinned persona screenshot, or null for auto-cycling.
- `navStuck` — set by the IntersectionObserver.
- Demo-only toggles: `showChrome`, `showUrl`, `showTabs`, `showNav`, `landingPage`. **Remove these entirely in production.**

No data fetching. Real needs: form handling for "Start free" (signup or waitlist), analytics, and possibly a CMS for copy.

---

## Design Tokens

### Color

```
/* Dark sections */
--dark-bg        #05070C   /* page background */
--dark-canvas    #070B12   /* hero / closing canvas */
--dark-panel     #0B1017
--dropdown-bg    #0E141F
--nav-stuck      rgba(11,15,23,.82) + blur(14px)

/* Light sections */
--light-canvas   #F5F7FA
--surface        #FFFFFF
--border         #E4E9F0
--divider        #F0F3F7

/* Text on dark */
--on-dark        #EEF2F8
--on-dark-2      #C7CEDA
--on-dark-3      #A2ABBC
--on-dark-4      #8B95A7
--on-dark-5      #5A6478

/* Text on light */
--ink            #0C1220
--ink-2          #3B4658
--ink-3          #5A6577
--muted          #96A0B2

/* Accents */
--cyan           #35D6E8   /* agency, default */
--amber          #F0913A   /* coach */
--coral          #EC5242
--violet         #C7A0C0   /* consultant */
--cyan-light     #0E93AC
--coral-light    #C4501F
--violet-light   #6E5AA8

/* Gradients */
--text-gradient  linear-gradient(95deg, #F5A15A, #EC5242 45%, #35D6E8)
--cta-gradient   linear-gradient(135deg, #F0913A, #EC5242)

/* Hairlines on dark */
--rule-strong    rgba(255,255,255,.22)
--rule           rgba(255,255,255,.16)
--rule-soft      rgba(255,255,255,.12)
--rule-faint     rgba(255,255,255,.09)
--rule-ghost     rgba(255,255,255,.06)

/* Pattern */
--grid-line      rgba(255,255,255,.016)
--grid-dot       rgba(255,255,255,.05)
--trace          rgba(255,255,255,.11) → .13
```

### Typography

| Family | Use | Weights |
|---|---|---|
| **Hanken Grotesk** | Hero, section headlines, card titles, wordmark, metric figures | 700 |
| **Instrument Sans** | Body, nav, buttons, labels | 400 / 500 / 600 |
| **IBM Plex Mono** | Eyebrows, step numbers, micro-labels | 400 / 500 |

Marketing scale:

```
hero headline     66px / 700 / 1.06 / -.02em   (→34px @860, →29px @480)
closing headline  52px / 700 / 1.08
section headline  38px / 700 / 1.14           (→27px @860, →24px @480)
card title        23px / 700
subhead           20px / 400 / 1.6            (→17px @860)
body              17px / 400 / 1.6
nav link          15px / 400
small             14px
eyebrow / mono    11px uppercase, .14em tracking
```

Apply `text-wrap: balance` to headlines and `text-wrap: pretty` to body copy. Avoid hard `<br>`s; let the browser balance. Widows and orphans were deliberately minimized.

### Spacing

```
section padding (desktop)   124px 60px      (light sections)
                            104px 60px 116px (hero-adjacent)
section padding (≤1024)     34px horizontal
section padding (≤860)      68px 20px
section padding (≤480)      56px 16px
nav padding                 22px 60px  (→20px horizontal @860)
grid gap                    16px
card padding                32px 30px
```

### Radius

```
9-11px  buttons, small tiles, social icons
12px    FAQ rows
14px    step cards, screenshot frame, dropdown
18px    persona / feature / pricing cards
50%     asterisk badge, accent dots
```

### Shadow

```
card         0 1px 3px rgba(12,18,32,.05)
dropdown     0 24px 60px rgba(0,0,0,.5)
screenshot   0 26px 70px rgba(0,0,0,.55) + cyan rim
accent-glow  0 8px 24px rgba(41,169,224,.14)
```

### Motion

```
nav background       .25s ease (background-color, border-color)
orb breathe          ~18s and ~23s, independent, scale + opacity
trace sweep          23-41s, staggered negative delays, varied lengths
screenshot cycle     15s, three stages at 1/3 offsets
glow pulse           slow, synced loosely to the cycle
mobile menu          instant open/close
```

All decorative motion must be gated behind `prefers-reduced-motion: reduce`.

---

## Assets

**Logo** — same asterisk mark as the app (32×32 viewBox, four `stroke-width:3` round-capped lines). The locked lockup is: mark in the persona accent, a 1px vertical hairline divider (`rgba(255,255,255,.22)` on dark), then **KINECT** in Hanken Grotesk 700, `letter-spacing:.16em`, uppercase, `#EEF2F8`. Solid fills only; gradient marks were explicitly rejected.

**Product screenshots** — in `assets/`:
```
portal-board.png       agency dashboard, task board
coach-hq.png           coach dashboard, Coach HQ
consultant-hq.png      consultant dashboard, Practice HQ
consultant-board.png   consultant deliverables board
coach-checkin.png      coach weekly check-in
analytics-full.png     agency analytics (performance + time & budget)
```
These were captured from the prototypes at 2× and will go stale as the app evolves. **Re-capture from the real app once it exists**, and consider automating it so marketing never shows a UI that no longer ships.

**Customer logos** — six empty 132×44 slots in the hero strip. Need real logos (SVG), or remove the strip until they exist.

**Social icons** — inline X, LinkedIn, Instagram, YouTube glyphs in the footer; wire to real profiles.

**Fonts** — Google Fonts: Hanken Grotesk, Instrument Sans, IBM Plex Mono. Self-host for production performance.

No photography is used. All decoration is CSS gradients and inline SVG.

---

## Files

```
KINECT Marketing Site.dc.html    ← the design source (all four pages)
KINECT Marketing Site.html       ← self-contained standalone build; open in any
                                   browser offline to click through all four pages
assets/                          ← product screenshots used in the page sections
```

The `.dc.html` needs its sibling `support.js` and `image-slot.js`; the `.html` is fully self-contained and the easier reference.

---

## Gaps / Decisions Needed

1. **Routing architecture** — four hostnames, or one app with subdomain-based persona resolution? The latter is less duplication; decide before building, it shapes everything.
2. **Copy source** — hardcoded today. Decide on a CMS before the marketing team needs to edit.
3. **Legal pages** — Privacy Policy, Terms and Conditions, Security, and Cookie Preferences are linked but not designed. Cookie preferences implies a consent mechanism.
4. **"Start free" destination** — signup flow, waitlist, or demo request? Not designed.
5. **Customer logos** — the strip is empty placeholders; do not ship it empty.
6. **Screenshot freshness** — will drift from the real app; plan for re-capture.
7. **SEO and metadata** — no titles, descriptions, OG images, or structured data are designed. Needed per page, and per persona subdomain.
8. **Analytics and attribution** — not wired. Worth deciding alongside the app's own analytics.
9. **Mobile verification** — responsive layer written but untested on devices.
10. **Demo chrome must not ship** — the fake browser frame, URL bar, and page-switcher tabs exist only for design review.
