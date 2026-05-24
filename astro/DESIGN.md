# DESIGN.md — MicioDev design system reference

Everything needed to understand the visual design and CSS of this project, in
one place. The design spec it implements lives at `../README.md`. Values below
are final (high-fidelity); the markup is `.astro` / `.vue`.

Where this is implemented: `src/styles/tokens.css` (token surface),
`src/styles/app.css` (Tailwind `@theme` mapping + `@font-face` + base resets +
`.md-*` utilities), and the section components under `src/components/`.

---

## 1. Brand & art direction

- **Voice:** senior freelance full-stack developer; editorial, precise,
  code-craft signals without cliché. Primary audience: Italian agencies & SaaS
  teams. Trilingual: Italian / English / Spanish.
- **Brand color:** a deep **sage-emerald green**. *Never lime, never neon.*
  One value in light mode; lifted to a "phosphor" green in dark mode.
- **Signature gestures:**
  - **Monospace micro-labels** — all-caps, tracked (`letter-spacing` ~.12–.18em),
    `--text-3` color, often preceded by a 5 px brand-green dot ("eyebrow").
  - **Italic display serif headlines** (Instrument Serif), tight tracking
    (~ −.02 to −.028em), line-height ≤ 1.
  - **`§ NN` section counters** in mono, in the gutter, on every section header.
  - **Hairlines, not hard borders** between sections (1 px `--line` + a mono
    `§ NN — name` label). The nav has a (scroll-triggered) bottom hairline.
  - **Per-language `[IT]` / `[EN]` / `[ES]` tags** in mono before strings appeared
    in the prototypes only — production is one language per route, so these
    bracketed tags are not rendered.
  - **Atmosphere** (hero & footer): layered soft radial gradients in brand
    green + a fine masked dot grid + faint SVG fractal-noise grain + crosshair
    corner marks + a faded mono "build stamp". All decorative / `aria-hidden`.
    In this build the hero's *light-mode* atmosphere is a supplied photo
    (`src/assets/hero.webp`) carrying that same vocabulary; the CSS layers are
    the *dark-mode* fallback. (See §4 / §7.)
  - **Footer is the only inverted surface** in both modes — a strong terminal
    beat, hard-coded `#0A0B0A`.

---

## 2. Color tokens

All in `src/styles/tokens.css` on `:root`, with a `:root[data-theme="dark"]`
override block. **Components reference the *semantic* variables** (`--bg`,
`--text`, `--line`, `--brand`, …) so they flip with the theme automatically.
The raw palette + the semantic names are also mirrored into Tailwind v4's
`@theme` in `app.css` (`--color-brand-*`, `--color-ink-*`, `--color-bg`, …).

### Brand greens

| Token | Hex | Role |
|---|---|---|
| `--brand-50` | `#EAF3ED` | tint background (light) |
| `--brand-100` | `#CFE3D5` | tint-2 (light) |
| `--brand-200` | `#9CC8AA` | |
| `--brand-300` | `#5FA577` | |
| `--brand-400` | `#2F8556` | |
| `--brand-500` | `#1F6E4A` | **primary (light)** |
| `--brand-600` | `#15533A` | hover (light) |
| `--brand-700` | `#0E3F2C` | press (light) |
| `--brand-800` | `#0A3424` | |
| `--brand-900` | `#052017` | |
| `--brand-glow` | `#3FB07A` | **primary (dark)** — phosphor |

### Warm neutrals

| Token | Hex |
|---|---|
| `--ink-0` | `#FFFFFF` |
| `--ink-50` | `#FAFAF7` |
| `--ink-100` | `#F4F4EF` |
| `--ink-150` | `#EDEDE7` |
| `--ink-200` | `#E2E2DA` |
| `--ink-300` | `#CECEC4` |
| `--ink-400` | `#9A9A8F` |
| `--ink-500` | `#6E6E64` |
| `--ink-600` | `#4A4A42` |
| `--ink-700` | `#2A2A25` |
| `--ink-900` | `#0E0E0C` |
| `--ink-950` | `#070706` |

### Semantic — light (default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `--ink-50` | page background |
| `--surface` | `--ink-0` | cards, inputs |
| `--surface-2` | `--ink-100` | status strip, mockup chrome, subtle fills |
| `--surface-3` | `--ink-150` | deepest fill, disabled button bg |
| `--line` | `--ink-200` | hairlines, card borders |
| `--line-2` | `--ink-300` | input borders, stronger dividers |
| `--text` | `--ink-900` | primary text, headlines |
| `--text-2` | `--ink-600` | body copy, secondary |
| `--text-3` | `--ink-500` | mono micro-labels, meta, placeholders |
| `--brand` | `--brand-500` | brand fills, links, accents |
| `--brand-hover` | `--brand-600` | |
| `--brand-press` | `--brand-700` | |
| `--brand-tint` | `--brand-50` | icon chips, badges, primary pills bg |
| `--brand-tint-2` | `--brand-100` | |
| `--on-brand` | `--ink-0` | text on brand fills |
| `--focus-ring` | `color-mix(in oklab, var(--brand-500) 60%, white)` | 3 px focus ring |
| `--danger` | `#B4321F` | form errors |

### Semantic — dark (`[data-theme="dark"]`)

| Token | Value |
|---|---|
| `--bg` | `#0A0B0A` |
| `--surface` | `#111210` |
| `--surface-2` | `#16170F` (whisper of warm-green) |
| `--surface-3` | `#1C1D17` |
| `--line` | `#232520` |
| `--line-2` | `#2E312A` |
| `--text` | `#F1F1EA` |
| `--text-2` | `#B7B7AC` |
| `--text-3` | `#80807A` |
| `--brand` | `--brand-glow` (`#3FB07A`) |
| `--brand-hover` | `#5BC290` |
| `--brand-press` | `#76CFA4` |
| `--brand-tint` | `color-mix(in oklab, var(--brand-glow) 14%, #0A0B0A)` |
| `--brand-tint-2` | `color-mix(in oklab, var(--brand-glow) 22%, #0A0B0A)` |
| `--on-brand` | `#062014` |
| `--focus-ring` | `color-mix(in oklab, var(--brand-glow) 70%, black)` |
| `--danger` | `#E36D58` |

> Footer-only literals (don't use elsewhere): background `#0A0B0A`, text
> `#F1F1EA`, hairlines `rgba(255,255,255,.08)`, borders `rgba(255,255,255,.14)`,
> secondary text `rgba(255,255,255,.5–.72)`, dark-on-glow text `#062014`.

> Contrast: brand ≈ 7.4 : 1 (light), ≈ 9.1 : 1 (dark) — AA+ in both modes.

---

## 3. Typography

### Families (`tokens.css` + `@font-face` in `app.css`)

- `--font-display`: `"Instrument Serif", "Times New Roman", serif` — used for
  **all `h1`–`h4`** and large emails; italic for headlines/eyebrowed titles,
  roman elsewhere. `font-weight: 400` always. `letter-spacing: -.01em` (more
  negative on big sizes).
- `--font-body`: `"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif`
  — body copy, buttons, nav links. Weights 400 / 500 / 600.
- `--font-mono`: `"Geist Mono", ui-monospace, "JetBrains Mono", monospace` —
  eyebrows, `§ NN` counters, meta strings, stack tags, KPI labels, form labels.
  Weights 400 / 500.

Base body: `font-feature-settings: "ss01","ss02","cv11"`,
`-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`.

### Type scale (px; `--fs-*` / `--lh-*`)

| Token | size / line-height | Typical use |
|---|---|---|
| `d2` | 88 / 88 | rarely — display 2 |
| `d1` | 64 / 68 | display 1 |
| `h1` | 44 / 48 | spec headings (real hero H1 is fluid, see below) |
| `h2` | 32 / 36 | |
| `h3` | 24 / 30 | card titles (group titles in Skills) |
| `h4` | 18 / 24 | |
| `bl` | 18 / 28 | large body (hero subhead) |
| `b` | 15 / 22 | **base body** |
| `s` | 13 / 20 | small copy, card descriptions (~13–13.5) |
| `m` | 11 / 14 | mono micro-labels |

**Fluid headline sizes used in sections** (not in the token scale):
- Hero H1: `clamp(48px, 11vw, 72px)` mobile → `clamp(72px, 8.4vw, 124px)` ≥ 960 px;
  `line-height: .96`, `letter-spacing: -.028em`, `text-wrap: pretty`.
- Section H2 (Services / Projects): `42px` mobile → `clamp(56px, 6vw, 92px)`;
  `line-height: .98`, `letter-spacing: -.025em`, `text-wrap: balance`.
- Skills H2: `36px` → `clamp(40px, 4.4vw, 60px)`; `lh 1.02`, `ls -.022em`.
- Contact H2: `42px` → `clamp(56px, 6vw, 84px)`; `lh .98`, `ls -.025em`.
- Featured project title: `clamp(34px, 3.2vw, 48px)`, `lh 1.02`, `ls -.02em`.
- Grid project title: `30px`, `lh 1.05`, `ls -.02em`.
- Footer email: `48px` mobile → `clamp(72px, 8vw, 124px)`; `lh .96`, `ls -.028em`.
- Service card title: `26px` italic, `lh 1.05`, `ls -.02em`.

**The bracketed locale tag** before H1 / subhead / card copy: `font-style: normal`,
`font-family: var(--font-mono)`, `font-size: ~.18–.24em` (relative, so it
scales with the headline) or `11px` for body, `vertical-align: .6–.7em`,
`color: var(--text-3)`, `letter-spacing: .14em`.

**Headline accent word** ("two lines" in the prototype): `color: var(--brand)`.

---

## 4. Spacing, radii, shadows, motion

### Spacing — 4 px base (`--sp-*`, also Tailwind `--spacing-*`)

`--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 ·
`--sp-7` 48 · `--sp-8` 64 · `--sp-9` 96 · `--sp-10` 128 (and `--sp-0` 0).

### Section padding rhythm

| Section | Desktop (≥ 960) vertical · horizontal | Mobile vertical · horizontal |
|---|---|---|
| Hero | 120 top / 40 bottom · 64 | 88 / 28 · 22 |
| Services | 96 / 112 · 64 | 64 / 80 · 22 |
| Projects | 96 / 112 · 64 *(prototype shows up to 120/140)* | 64 / 80 · 22 |
| Skills | 96 / 112 · 64 | 56 / 64 · 22 |
| Contact | 120 / 140 · 64 | 64 / 80 · 22 |
| Footer | 88 / 40 · 64 | 56 / 32 · 22 |
| Section divider | 12 top + 12 bottom · 64 (22 mobile) | — |

(The codebase uses `64px` horizontal at ≥ 960 px / `22px` below, matching the
mobile prototype; the desktop prototype occasionally used 56.)

The padding sequence reads as a deliberate exhale: hero → services → projects →
skills → contact widen and narrow on purpose.

### Radii (`--r-*`)

`--r-1` 2 · `--r-2` 4 (buttons, inputs, mockup inner, small chips) ·
`--r-3` 8 (cards, panels) · `--r-4` 14 · `--r-pill` 999 (tags, pills, lang switch, theme toggle).

### Shadows (`--shadow-*`)

- `--shadow-1`: `0 1px 0 rgb(14 14 12/.04), 0 1px 2px rgb(14 14 12/.04)` — resting micro-lift.
- `--shadow-2`: `0 1px 0 rgb(14 14 12/.04), 0 6px 18px rgb(14 14 12/.06)` — **hover on cards**.
- `--shadow-3`: `0 12px 36px rgb(14 14 12/.10)` — overlays.
- `--shadow-focus`: `0 0 0 3px var(--focus-ring)` — focus ring on everything interactive.
- Dark mode swaps the rgba to black at higher alpha (.35 / .4 / .5 / .55).

### Motion (`--ease`, `--dur-*`)

- Curve: `--ease: cubic-bezier(.2,.7,.3,1)` (a confident ease-out; mapped to
  Tailwind `--ease-md`).
- Durations: `--dur-1` 120 ms (buttons, color/box-shadow), `--dur-2` 180 ms
  (card border/shadow/transform, nav hairline), `--dur-3` 240 ms.
- **No bounce, no parallax.** Hover = `translateY(-2px)` + border→`--text` +
  `--shadow-2`. Active button = `translateY(1px)` + `--brand-press`.
- `prefers-reduced-motion: reduce` → blanket `animation:none; transition:none;`
  (in `tokens.css`).

### Hero / footer atmosphere recipe

1. base = `var(--bg)`
2. mesh = 3× `radial-gradient` of `color-mix(in oklab, var(--brand) 22%/14%/10%, transparent)` at corners, `filter: blur(8px)`, on a `-10%` inset layer.
3. dot grid = `radial-gradient(currentColor 1px, transparent 1.2px)`, `background-size: 24px 24px` (18 px on mobile), `color: color-mix(in oklab, var(--text) 12%, transparent)`, masked: `radial-gradient(70% 60% at 50% 45%, black, transparent 95%)`.
4. hairline = 1 px `var(--line)` near the top (y ≈ 60).
5. grain = inline SVG `<filter id="md-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter>`, applied as `filter:url(#md-grain); opacity:.7 (.5 mobile); mix-blend-mode:multiply`.
6. corner marks = 4× 14 px crosshairs (1 px lines), `color:var(--text-3)`, `opacity:.6`; hidden on mobile.
7. stamp = mono build label, `opacity ~.36`, bottom-right.

Footer atmosphere is the same idea but two radials in `--brand-glow` at ~14% / 10%, no grid/grain/marks.

**In this build:** the **light-mode** hero atmosphere is the supplied photo
`src/assets/hero.webp` (1672×941 — a light abstract tech pattern that already
contains the dot grid / circuit lines / green glows / `{ }` / diamond
vocabulary), rendered via `astro:assets` `<Image>` as a full-bleed
`object-fit: cover` layer + a bottom-fading scrim. The CSS `mesh` + `dots`
layers are hidden in light mode and only render in **dark mode** (the photo is
hidden there). `grain`, the hairline, corner marks and the build stamp render
in both. The footer atmosphere remains pure CSS.

---

## 5. Component patterns (`.md-*` in `app.css`)

### Eyebrow — `.md-eyebrow`

Mono, `font-size: var(--fs-m)` (11), `letter-spacing: .14em`, `text-transform:
uppercase`, `color: var(--text-3)`, `font-weight: 500`. Optional leading
`.dot`: 5 px circle, `background: var(--brand)`, `margin-right: 8px`,
`vertical-align: 1px`.

### Hairline — `.md-hr`

`height: 1px; background: var(--line); border: 0; margin: 0;` — used inside
cards to separate head ↔ body, and after copy blocks.

### Buttons — `.md-btn` (+ `--secondary`, `--ghost`)

- Base: `inline-flex; gap:8px; height:40px; padding:0 18px; border-radius:var(--r-2);`
  `font: 500 14px/1 var(--font-body); letter-spacing:.005em;` primary fill
  `var(--brand)`, text `var(--on-brand)`. Transitions bg/border/color/shadow/transform at `--dur-1`.
- Hover → `--brand-hover`. Focus-visible → `--shadow-focus`. Active →
  `--brand-press` + `translateY(1px)`. Disabled → `--surface-3` bg / `--text-3` text.
- `--secondary`: transparent bg, `--text` color, `--line-2` border; hover →
  `--surface-2` bg + `--text` border.
- `--ghost`: transparent; hover → `--surface-2` bg.
- `.arrow` glyph inside (the `→`): `font-family: var(--font-mono); font-size: 13px;`.
- Hero CTAs override to `height:48px; padding:0 22px; font-size:15px`. Nav CTA
  is `height:36px; padding:0 16px`.

### Tags / pills — `.md-tag` (+ `--brand`, `--solid`) and the Skills pills

- `.md-tag`: `inline-flex; gap:6px; height:24px; padding:0 10px; border-radius:var(--r-pill);`
  `font: 500 12px/1 var(--font-mono); letter-spacing:.08em; text-transform:uppercase;`
  bg `var(--surface-2)`, color `var(--text-2)`, 1 px `var(--line)` border.
  `--brand` = `--brand-tint` bg / `--brand` text / transparent border;
  `--solid` = `--brand` bg / `--on-brand` text.
- **Stack tags on project cards** (`StackTag`): transparent bg, `--text-2`,
  `height:22px; padding:0 9px; border-radius:999px; font: 11px var(--font-mono);`
  1 px `--line-2` border, `white-space:nowrap`.
- **Skills pills — three weights** (mono 12 / 500, height 28, `padding:0 12px`, pill radius):
  - `primary`: `--brand-tint` bg, `--brand` text, 1 px `color-mix(in oklab, var(--brand) 24%, transparent)` border, leading 5 px brand dot.
  - `daily`: `--surface` bg, `--text` color, 1 px `--line-2` (solid) border.
  - `default`: transparent bg, `--text-2`, 1 px **dashed** `--line-2` border.

### Inputs — `.md-input`, `.md-field`

- `.md-field`: `flex column; gap:6px`. Label: `font: 500 12px/1 var(--font-mono);
  letter-spacing:.12em; text-transform:uppercase; color:var(--text-3)` —
  **always visible above the input, never placeholder-as-label**.
- `.md-input`: `height:44px; padding:0 14px; bg:var(--surface); border:1px solid var(--line-2);
  border-radius:var(--r-2); color:var(--text); font: 400 15px/1 var(--font-body); width:100%`.
  Placeholder `var(--text-3)`. Hover → border `var(--text)`. Focus → border
  `var(--brand)` + `--shadow-focus`. `[data-state="error"]` → border `var(--danger)`.
  Disabled → `--surface-2` bg / `--text-3` text. `textarea.md-input`: `min-height:140px;
  padding:14px; line-height:1.55; resize:vertical`. Select uses
  `appearance:none` + a `▾` caret absolutely positioned at `right:14px`.
- Field hint (right of the label): mono 11, `--text-3`, or `--danger` on error,
  `--brand` on success (e.g. "✓ ready · 423 chars", "✕ not a valid email", "0 / 4000").

### Cards — `.md-card` & specific cards

- `.md-card`: `bg:var(--surface); border:1px solid var(--line); border-radius:var(--r-3);
  padding:var(--sp-5); flex column; gap:var(--sp-4)`. Hover → border `var(--text)` +
  `--shadow-2`. Transitions at `--dur-2`.
- **Service card**: padding 28; head row = 48 px brand-tinted icon chip
  (`--brand-tint` bg, 1 px `color-mix(in oklab, var(--brand) 20%, transparent)`,
  `--r-2`, `--brand`-colored 28 px line icon) on the left, `/ NN` mono index on
  the right; then italic 26 title; `.md-hr`; ~13.5 / 1.55 `--text-2` copy;
  optional `.md-tag` row. Desktop: 6-col grid, cards 1–3 span 2 cols, cards 4–5
  span 3 cols; tablet 3-col; mobile 1-col.
- **Project featured card**: a single `<a>`, `display:grid; grid-template-columns:1.4fr 1fr`
  on desktop (stacked on mobile), `border-radius:var(--r-3); overflow:hidden`.
  Left pane (`--surface-2` bg, 1 px right border): a 16/10 striped **mockup
  slot** with a 28 px browser chrome (3 dots + a `--surface-3` url bar) and a
  diagonal `repeating-linear-gradient(135deg, var(--surface) 0 12px, var(--surface-2) 12px 24px)`
  body, label "PROJECT MOCKUP · 16 / 10"; below it a 4-up KPI row (mono 10
  uppercase label, italic display 22 value). Right pane (padding 28): client
  crest + `CLIENT · / NN` + period (mono), a **Featured badge**, the italic
  title, the `[lang]` + description, `.md-hr`, the stack tags, then a footer
  row "↗ Open case study" + external-link icon. Whole card spans both grid cols.
- **Project grid card**: compact `<a>`, padding 26, flex column gap 18: 36 px
  client crest + `CLIENT · / NN` + period, optional Featured badge + external
  icon on the right; italic 30 title; `[lang]` + 13 / 1.55 description;
  `.md-hr`; stack tags.
- **Featured badge**: `inline-flex; gap:6px; height:22; padding:0 10; pill; bg:var(--brand-tint);
  color:var(--brand); font: 500 10px var(--font-mono); letter-spacing:.16em; uppercase;`
  1 px `color-mix(in oklab, var(--brand) 22%, transparent)` border; leading
  5 px brand dot with `box-shadow:0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent)`.
- **Client crest**: circle (44 px on featured, 36 px on grid), `--surface-2` bg,
  1 px `--line-2` border, `--text` mono initials (13 / 11).
- **Card hover (projects)**: `translateY(-2px)`, border → `--text`, `--shadow-2`,
  footer text inks `--brand`, the `↗` external icon nudges `translate(2px,-2px)`,
  ~200 ms ease-out, reduced-motion respected.

### Mono meta strings

Status/availability lines, `§ NN` counters, `↳ index · §0N`, "v 1.1.0", etc.:
mono 10–11, `--text-3`, `letter-spacing:.08–.18em`, often uppercase. Brand
"live" dot: 6 px circle, `--brand`, with `box-shadow:0 0 0 3px color-mix(in
oklab, var(--brand) 22–25%, transparent)`.

---

## 6. Layout & grid

- **Editorial 12-column grid** on desktop (`grid-template-columns: repeat(12, 1fr)`,
  `column-gap: 24px`); collapses to a single column on mobile.
- Section headers commonly use: eyebrow in cols `1 / 4`, H2 in `4 / 11`, a mono
  note in `11 / 13` (right-aligned, `align-self:end`).
- Hero: eyebrow row full width; H1 in `1 / 9`; subhead + CTAs + meta in `9 / 13`
  (`align-self:end`); trust strip full width.
- Projects grid: `1fr 1fr` (featured spans both); mobile 1-col. Services grid:
  6-col (see card section); mobile 1-col. Skills: 4-col group columns inside a
  panel bordered top & bottom by `--line`; mobile 1-col (tablet 2-col). Contact:
  `1.6fr 1fr` (form / aside); mobile 1-col.
- **Breakpoint:** the codebase uses a single primary breakpoint at **960 px**
  (`min-width: 960px`) to switch from the mobile single-column layout to the
  desktop multi-column layouts; a few grids also use **640 px** for an
  intermediate 2-column step (Services, Skills). Mobile reference width is
  **390 px** (iPhone 14). Desktop reference width is **1440 px**.
- **Section dividers** (`SectionDivider.astro`): a flex row, `padding:12px 0`,
  mono 10 uppercase `.18em` label ("§ 02 — Services") + a `flex:1` 1 px
  `--line` rule. `aria-hidden`. **Not a hard border.** The numbering in this
  build: §01 Hero · §02 Services · §03 Projects · §04 Skills · §05 Contact.
  (The Contact prototype file labels it §06; the assembled prototype and this
  build use §05.)

---

## 7. Per-section / per-component spec

### Nav (`src/components/vue/Nav.vue`)

- Sticky, `top:0`, `z-index:50`. Background `color-mix(in oklab, var(--bg) 88%,
  transparent)` with `backdrop-filter: blur(8px)`. Bottom hairline `--line`
  appears once scrolled (`scrollY > 4`), transitioned at `--dur-2`.
- **Status strip** (top, full width): `padding:8px 22px` (32 desktop), bottom 1 px
  `--line`, bg `--surface-2`, mono 11 `--text-3` `.08em` uppercase — left: brand
  "live" dot + "AVAILABLE FOR PROJECTS — Q3 2026", right: "FUERTEVENTURA · UTC+0".
- **Bar**: desktop is a 3-column grid (`auto 1fr auto`): left = wordmark, center
  = links, right = controls. Mobile is wordmark + hamburger only; links/controls
  move into a drawer.
  - **Wordmark**: the brand logo (`src/assets/logo-miciodev.jpg` — neon
    cat-on-a-monitor on near-black; optimized via `astro:assets` `getImage()`,
    served as a 60 px `.webp`, displayed at 30 px with `border-radius: var(--r-2)`,
    `object-fit: cover`) + "Micio" (display italic 24) + "Dev" (mono 14 normal,
    `.04em`). Links to home, `aria-label` set. (Astro processes the image in the
    layout and passes `{ src, width, height }` to the Vue island as a `logo` prop.)
  - **Links** (desktop): mono 10 `.12em` index numeral + 14 / 500 Geist label,
    28 px gap, `--text-2` (→`--text` active). Active state: `aria-current="page"`
    + a 1 px `--brand` underline (`left/right:4px; bottom:2px`).
  - **Controls** (desktop, right): `LangSwitch` · 1 px×20 `--line` divider ·
    `ThemeToggle` · primary `.md-btn` "Hire me →" at height 36.
  - **Hamburger** (mobile): 36 px square, 1 px `--line`, `--surface` bg, `--r-2`;
    two stacked 1.5 px bars (16 px + 11 px, offset) → an X when open. `aria-expanded`.
  - **Drawer** (mobile, when open): `.md-hr`; link list with each row `padding:14px 0`,
    bottom 1 px `--line`, display italic 28 (`--text-2`, `--text` active), mono
    index + a `↗` glyph (`--brand` when active); then a row with `LangSwitch`
    (size sm) + `ThemeToggle`; then a full-width primary `.md-btn` "Hire me →".
    Closes on Escape.

### LangSwitch (`src/components/vue/LangSwitch.vue`)

Segmented pill: `inline-flex; border-radius:999px; padding:2px; border:1px solid
var(--line); bg:var(--surface)`; height 32 (md) / 28 (sm). Each option is an
`<a role="radio">` with `aria-checked`, mono 11 / 500 `.14em`, `padding:0 12px`,
`--text-2` (→`--text` on hover); the active one gets `bg:var(--brand);
color:var(--on-brand)`. **Keyboard:** roving `tabindex` (only the active option
is `tabindex=0`); ArrowRight/Down/Left/Up cycle, Home/End jump; the hrefs are
locale-prefixed and **preserve the current path**. `variant="dark"` (footer):
transparent bg, `rgba(255,255,255,.14)` border, options `rgba(255,255,255,.7)`
(→ `#fff`), active = `--brand-glow` bg / `#062014` text.

### ThemeToggle (`src/components/vue/ThemeToggle.vue`)

32 px circle, 1 px `--line`, `--surface` bg, `--text` icon (→ border `--text` on
hover). Shows a **moon** when dark (→ action: switch to light), a **sun** when
light. `aria-label` reflects the action; `aria-pressed` reflects `dark`. Click
flips `document.documentElement.dataset.theme` and persists to
`localStorage('miciodev-theme')`. On mount it syncs `dark` from the existing
`data-theme` (set by the head bootstrap script). It listens to
`prefers-color-scheme` changes and follows the OS **only if** there's no saved
`miciodev-theme`.

### Hero (`src/components/astro/Hero.astro`)

- Atmosphere: in **light mode** the `src/assets/hero.webp` photo (full-bleed
  `<Image>`, `object-fit: cover`, responsive `widths`, eager + high priority) +
  a bottom scrim fading to `--bg`; in **dark mode** the CSS mesh + masked dot
  grid (see §4 recipe). Plus `grain`, the top hairline, 4 corner marks (desktop
  only) and the mono build stamp in both modes.
- Header row (full width): eyebrow (".dot" + "Freelance · Full-stack · Since
  2010"); on desktop a mono meta cluster on the right ("§ 01 / Hero" · "Fuerteventura
  · UTC+0" · "v 1.1.0").
- **H1** (the page's only `<h1>`): three `<span class="hero__line">` lines —
  line 1 prefixed with the `[LANG]` mono tag, line 2 contains the brand-green
  accent word + a comma, line 3 plain. Fluid sizing per §3.
- Right column (`align-self:end` on desktop): subhead `<p>` (18 / 1.55,
  `--text-2`, `max-width:380px`, `[LANG]` tag prefix); CTA row — primary
  `.md-btn` "View projects →" + secondary `.md-btn--secondary` "Contact me",
  both at height 48; meta row — brand "live" dot + "Available · Q3 2026" and "↳
  replies in 24 h" (mono 11 `--text-3` uppercase).
- **Trust strip** (full width): a head row (eyebrow "Trusted by — selected
  clients, 2018–2026" + a "07 / 42" mono count), `.md-hr`, then a flex-wrap row
  of decorative client marks — each = an 18 px abstract SVG glyph
  (circle/diamond/triangle/hex/square/arc/dot) + a mono 11 `.18em` uppercase
  `--text-3` label; the whole strip is `filter: grayscale(1)`. Mobile: the strip
  scrolls horizontally; the dot grid is 18 px and the grain opacity ~.5.
- **Animation intent** (orchestrated entrance, ~1.9 s, ease-out, reduced-motion
  guarded — not implemented yet): 0 ms atmosphere fade-in (600) → 120 ms eyebrow
  type-in (520) → 240 ms headline 3-line mask-up, 90 ms stagger, 32 px y-offset
  (900) → 780 ms brand accent word crossfade (540) → 900 ms subhead rise +12 px
  (480) → 1080 ms CTAs settle, primary scales .96→1, secondary fades +80 ms
  (420) → 1320 ms trust strip slides from left, 60 ms stagger (600) → ambient:
  mesh hue rotates ±3° on a 24 s loop.

### Services (`src/components/astro/Services.astro`)

Header (eyebrow "§ 02 · Services" / italic H2 "What I do, in five clear lines"
prefixed with `[LANG]` / mono note "5 services · no pricing here · per-project
quote"). Then the 6-col card grid (3 cards × 2 cols, then 2 cards × 3 cols on
desktop; 2-col tablet; 1-col mobile) — see "Service card" in §5. Five inline
**28 px / 1.4-stroke line icons** (`round` caps & joins), keyed
`stack` / `api` / `vps` / `compass` / `magnifier`:
`stack` = three layered slabs joined on the side with three dots;
`api` = two endpoints exchanging arrows in the middle;
`vps` = a server rack with lit ports;
`compass` = a circle with a faceted needle (filled at .18 opacity);
`magnifier` = curly braces around a small lens.
Footer row: mono note "Not on this list — design from scratch · mobile-native
apps · WordPress" + "↳ index · §02", with a top 1 px `--line`.

### Projects (`src/components/astro/Projects.astro` + `ProjectCard.astro`)

Header (eyebrow "§ 03 · Selected work" / italic H2 "Things shipped, kept
running" / mono note "05 visible · 42 archive · 2010 — 2026"). A **filter bar**
(currently static placeholder controls) bordered top & bottom by `--line`: a
"Filter" eyebrow + chips (All / SaaS / E-commerce / Dashboards / Editorial; the
active one is `--text` bg / `--bg` text) and, on desktop only, a "Stack" eyebrow
+ ghost chips (Laravel / Vue / Nuxt / TypeScript / Node) — chips are 26 px,
mono 11, pill, 1 px `--line-2`/`--line`. Then the grid: 1 featured card (spans
both cols, data sorted featured-first) + the remaining grid cards; 1-col on
mobile. Footer: a display-italic 28 link "Browse the archive — 42 projects
since 2010" (with a mono `[LANG] →` prefix) + "↳ index · §03", top 1 px `--line`.

### Skills (`src/components/astro/Skills.astro`)

Header (eyebrow "§ 04 · Skills" / italic H2 "Tools, in four families" / mono
note "No bars, no percentages. Just things I use."). Then a **panel** bordered
top & bottom by `--line`, `padding:24px 0`, containing a 4-column grid (2-col at
640 px, 1-col mobile) of **groups**. Each group: a `/ NN` eyebrow, an italic 24
title (with a tiny `[LANG]` mono tag), then a flex-wrap row of **pills** in the
three weights (see §5). Footer: a **legend** (mono 11 `--text-3` uppercase) with
one example pill of each weight + its meaning ("daily & preferred" / "in current
rotation" / "when the job needs it") and "↳ index · §04". Tech names & weights
are kept from the design reference (PHP/Laravel/TypeScript/Vue/Nuxt/Python,
Linux/Nginx/Docker/DigitalOcean/Hetzner, Git/GitHub Actions/CI·CD/Claude Code,
Stripe/ImageKit/Supabase/PocketBase).

### Contact (`src/components/astro/Contact.astro` + `ContactForm.vue`)

Header (eyebrow "§ 05 · Contact" / italic H2 "Tell me about it" prefixed with
`[LANG]`). Layout `1.6fr 1fr` (1-col mobile):
- **Form panel** (`--surface` card, 1 px `--line`, `--r-3`, padding 36 / 22
  mobile) holds `ContactForm.vue` (`client:visible`):
  - 12-col internal grid (collapses on mobile); fields: Name (span 6), Email
    (span 6), Subject (span 12, native `<select>` with the `▾` caret), Message
    (span 12, textarea, min-height 140, with a "{count} / 4000" counter beside
    the label). Labels always visible above (mono uppercase). A hidden
    `website` **honeypot** (off-screen, `tabindex=-1`, `aria-hidden`).
  - **Live validation**: name required; email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`;
    message 20–4000 chars. Errors appear below the field in mono 11 `--danger`
    with `role="alert"`; the input gets `data-state="error"` (red border).
  - **States** (from the prototype): default (empty, neutral); error (e.g.
    email "mario@studio" → red border + "✕ not a valid email", submit disabled);
    success (fields filled, hint "✓ ready · 423 chars", submit shows "✓ Sent —
    thanks!" in the press style).
  - **Feedback region**: an `aria-live="polite"` `<p>` above the submit button;
    mono 12; `--brand` on success, `--danger` on error.
  - Submit row: a mono 11 uppercase "By sending you accept the privacy policy."
    note on the left, the primary `.md-btn` "Send message →" (height 48) on the
    right; disabled while submitting; POSTs JSON to `/api/contact`.
- **Aside** (`--surface` card, 1 px `--line`, `--r-3`, padding 28): a "Direct"
  eyebrow; a display-italic 32 `micio86dev@gmail.com` mailto link (from
  `PUBLIC_CONTACT_EMAIL` / `src/lib/site.ts`), underlined with
  `--brand` (1 px, offset 6 px); `.md-hr`; a mono "I reply within 24 h" line;
  `.md-hr`; a meta block (mono 11 `--text-3` uppercase): "↳ Fuerteventura · UTC+0",
  "↳ CET-friendly hours", brand dot + "Available · Q3 2026".

### Footer (`src/components/astro/Footer.astro`) — always dark

`background:#0A0B0A; color:#F1F1EA`, padding `88/40 · 64` (`56/32 · 22` mobile),
faint two-radial `--brand-glow` atmosphere, `overflow:hidden`.
- **Sign-off block** (bottom-bordered with `rgba(255,255,255,.08)`): a mono 11
  `rgba(255,255,255,.7)` `.16em` uppercase eyebrow with a leading `--brand-glow`
  dot ("Open for new projects · Q3 2026"); then a giant display-italic mailto —
  `hello@`**`miciodev`**`.com` (the middle word in `--brand-glow`) + a small mono
  `↗` — at `clamp(72px, 8vw, 124px)` (48 px mobile).
- **Columns** (`1.4fr 1fr 1fr 1fr`, 1-col mobile, top-padded): (a) the brand
  logo (`src/assets/logo-miciodev.jpg` via `<Image>`, 36 px, `--r-2`,
  `densities={[1,2]}`) + "MicioDev" wordmark + a `rgba(255,255,255,.72)` 14 /
  1.55 blurb; (b) "Site" column — Work / Services / About / Contact, each link
  `#F1F1EA` 14 with a `rgba(255,255,255,.4)` `↳` prefix, hover → `--brand-glow`;
  (c) "More" column — Notes / Archive / Privacy / Imprint, same style; (d)
  "Elsewhere" — 38 px circular social buttons, one per row in the `socials`
  PocketBase collection (in its `order`; the seed set is GitHub / LinkedIn /
  YouTube / Instagram / TikTok / Facebook / Udemy). Each button's `icon` key
  picks an inline line-SVG from the `ICONS` map in `Footer.astro` (1 px
  `rgba(255,255,255,.14)` border, hover → `--brand-glow` border+icon; unknown
  keys fall back to a generic globe). Followed by a dark-variant `LangSwitch`
  (size sm, `client:visible`).
- **Colophon** (top-bordered, mono 11 `rgba(255,255,255,.7)` `.08em` uppercase):
  "© 2010 — 2026 · Alessandro · MicioDev" on the left; "Fuerteventura · IC · ES" +
  "Built with Astro + PocketBase · v 0.1.0" on the right.

---

## 8. Dark mode mechanics (recap)

- Truth: `document.documentElement.dataset.theme` = `"light"` | `"dark"`.
- A **blocking `is:inline` script in `<head>`** (before the stylesheet, in
  `BaseLayout.astro`) sets it from `localStorage('miciodev-theme')` else
  `prefers-color-scheme` — no FOUC.
- `ThemeToggle.vue` flips + persists it and follows the OS only while there's no
  saved choice.
- The footer is hard-coded dark; never reads `--bg`.

---

## 9. Accessibility checklist (design-level)

- One `<h1>` per page (Hero); `<h2>` per section; `<h3>` in cards / Skills groups.
- Form `<label>` always visible above the control — never placeholder-as-label.
- 3 px `--shadow-focus` ring on every interactive element (`:focus-visible`).
- Color contrast ≥ AA in both modes.
- `prefers-reduced-motion: reduce` → blanket animation/transition reset.
- Touch targets ≥ 44 × 44 px on coarse pointers (`@media (pointer: coarse)`).
- Contact-form feedback in an `aria-live="polite"` region; errors `role="alert"`.
- `LangSwitch` = ARIA radiogroup with arrow-key navigation.
- Skip-to-content link as the first `<body>` child (`.skip-link`).
- All decorative atmosphere / SVG marks are `aria-hidden`.

---

## 10. Open consistency notes (from the handoff audit — not yet resolved)

- The nav's own bottom hairline + the first inter-section divider below the hero
  can read as two competing top-rules — consider dropping one.
- Hero grain vs. the project mockup stripes can look busy stacked — a pure-white
  Services band between them was suggested.
- The Contact aside's display-italic email and the footer's giant display-italic
  email repeat the same gesture within ~900 px — pick one (recommendation: keep
  the footer giant, shrink the aside email to body size).
- Status meta strings vary slightly ("Fuerteventura · UTC+0" vs "Fuerteventura · IC · ES")
  — unify to one canonical line.
- The prototype animation timeline (hero entrance) is specified but not built.
- The projects filter bar is rendered but not wired.
- Self-hosted fonts and per-locale OG images are placeholders.
