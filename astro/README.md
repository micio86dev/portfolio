# micio86dev

Senior freelance full-stack developer portfolio for **MicioDev**.
Trilingual (English · Italian · Spanish), light + dark, mobile-first.

> Scaffolded from the design handoff in `../design_refs/` (+ `../README.md`).
> The `.astro` and `.vue` components recreate those HTML/JSX prototypes in the
> target stack — design values (hex / rem / px / easing / motion timings) were
> lifted; the markup was rebuilt with each tool's idioms rather than ported.

---

## Table of contents

1. [Stack](#stack)
2. [Quick start](#quick-start)
3. [Environment variables](#environment-variables)
4. [Available scripts](#available-scripts)
5. [Project structure](#project-structure)
6. [Routing & i18n](#routing--i18n)
7. [Design tokens & Tailwind v4](#design-tokens--tailwind-v4)
8. [Dark mode](#dark-mode)
9. [Fonts](#fonts)
10. [Vue islands](#vue-islands)
11. [Data: PocketBase](#data-pocketbase)
12. [Contact form & PocketBase](#contact-form--pocketbase)
13. [SEO & sitemap](#seo--sitemap)
14. [Accessibility](#accessibility)
15. [Building & deploying](#building--deploying)
16. [Troubleshooting](#troubleshooting)
17. [Roadmap / TODO](#roadmap--todo)

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro 5** | SSR (`output: 'server'`) — pages render on demand. Truly static pages can opt out with `prerender = true`. |
| Adapter | **`@astrojs/node`** (standalone) | `astro build` produces `dist/server/entry.mjs`, a self-contained Node server (also serves `dist/client`). Swap for `@astrojs/vercel` / `@astrojs/cloudflare` / `@astrojs/netlify` per host. |
| Interactive islands | **Vue 3** | `Nav` (`client:load`), `ThemeToggle` & `LangSwitch` (child islands / `client:visible` in the footer), `ContactForm` (`client:visible`). |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` | Tokens live in `src/styles/tokens.css` as CSS custom properties; `src/styles/app.css` imports Tailwind, maps tokens into a `@theme` block, declares `@font-face`, and defines the `.md-*` component utilities. |
| i18n | **Astro built-in i18n** | `defaultLocale: 'en'`, `locales: ['en','it','es']`, default locale served at `/` (no prefix). |
| Data | **PocketBase JS SDK** | Per-request fetch of `projects` + `services` (server-only, `src/lib/pocketbase.ts`); falls back to `src/lib/seed-data.ts` when PocketBase is unset/unreachable so the site still renders. |
| Contact | **PocketBase** | The form (browser) POSTs straight to `${PUBLIC_PB_URL}/api/collections/contacts/records`; submissions land in the `contacts` collection. No email service. |

---

## Quick start

```bash
# 1. install dependencies (nothing is installed in the scaffold)
npm install

# 2. (optional for local dev) create your env file
cp .env.example .env
#    set PUBLIC_PB_URL to your running PocketBase (e.g. http://localhost:8090);
#    without it the projects/services fall back to seed data and the contact
#    form has nowhere to POST.

# 3. run the dev server
npm run dev          # → http://localhost:4321

# 4. production build + run
npm run build        # → dist/client/ (static) + dist/server/entry.mjs (Node)
npm run preview      # serves the build locally

# 5. type-check
npm run check        # astro check
```

Routes available in dev: `/` (English), `/it/`, `/es/`.

---

## Environment variables

Copy `.env.example` → `.env`. Both variables are **optional for local
development** — without `PUBLIC_PB_URL` the site uses seed data and the contact
form has nowhere to POST.

| Variable | Used by | Purpose |
|---|---|---|
| `PUBLIC_PB_URL` | `src/lib/pocketbase.ts` (SSR), `Contact.astro` → `ContactForm.vue` (browser) | Public PocketBase base URL, e.g. `https://pb.micio86dev.it`. Read at **runtime** (`process.env` on the server; passed to the form as a prop). Unset/unreachable → seed-data fallback. Defaults to `http://localhost:8090`. |
| `SITE_URL` | `astro.config.mjs`, `BaseLayout.astro` | Canonical origin — `<link rel="canonical">`, `hreflang`, sitemap. Build-time. |

The `PUBLIC_` prefix is what lets the URL reach the browser bundle for the
contact form; `SITE_URL` is server-only.

---

## Available scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `astro dev` | Dev server with HMR. |
| `build` | `astro build` | Static pages + Node server entry. |
| `preview` | `astro preview` | Serve the production build. |
| `check` | `astro check` | Type-check `.astro` files and their TS imports. |
| `astro` | `astro` | The Astro CLI passthrough (`npm run astro -- add …`). |

---

## Project structure

```
micio86dev/
├─ astro.config.mjs            # i18n, integrations (vue, sitemap), Tailwind Vite plugin, Node adapter
├─ tsconfig.json               # extends astro/tsconfigs/strict
├─ .env.example                # documented env vars
├─ public/
│  ├─ favicon.svg              # MicioDev cat mark
│  ├─ logo.svg                 # mark + wordmark, standalone
│  ├─ robots.txt
│  └─ fonts/.gitkeep           # expected woff2 filenames are documented here
└─ src/
   ├─ assets/                  # images processed by astro:assets — logo-miciodev.jpg, hero.webp
   ├─ env.d.ts                 # ImportMetaEnv typings for the env vars above
   ├─ pages/
   │  ├─ index.astro           # English — served at "/"
   │  ├─ it/index.astro        # "/it/"
   │  └─ es/index.astro        # "/es/"   (all SSR — no `prerender`; the contact form posts directly to PocketBase)
   ├─ layouts/
   │  └─ BaseLayout.astro      # <html lang>, SEO head, hreflang, OG/Twitter, theme bootstrap, font preload, Nav, Footer, skip-link
   ├─ components/
   │  ├─ astro/                # zero-JS, static sections
   │  │  ├─ Hero.astro         # atmospheric mesh + dot grid + SVG grain + corner marks; the page's only H1; CTAs as <a>; trust strip
   │  │  ├─ Services.astro     # 5-card grid (3×2-col + 2×3-col on desktop); 5 inline line icons; data from getServices()
   │  │  ├─ Projects.astro     # header + (placeholder) filter bar + 2-col grid, featured card spans both; data from getProjects()
   │  │  ├─ ProjectCard.astro  # "featured" (mockup + KPIs + text) and "grid" (compact) variants, prop-driven
   │  │  ├─ Skills.astro       # 4 group columns; pill cloud with primary / daily / default weights; legend
   │  │  ├─ Contact.astro      # section header + form panel (ContactForm island) + direct-contact aside
   │  │  ├─ SectionDivider.astro # aria-hidden hairline + mono "§ NN — name" label between sections
   │  │  ├─ Footer.astro       # always-dark surface (#0A0B0A); big italic email; columns; social icons; LangSwitch island
   │  │  └─ SectionsHome.astro # the full landing-page section stack, shared across all locale routes
   │  └─ vue/                  # interactive islands
   │     ├─ Nav.vue            # sticky w/ backdrop blur; status strip; desktop links + mobile drawer; hosts ThemeToggle + LangSwitch
   │     ├─ ThemeToggle.vue    # reads/writes localStorage('miciodev-theme') + document.documentElement.dataset.theme; follows OS until manual override
   │     ├─ LangSwitch.vue     # ARIA radiogroup, arrow-key navigation; routes to /, /it/, /es/ preserving the current path; "default" + "dark" variants
   │     └─ ContactForm.vue    # live validation, char counter, honeypot, aria-live feedback, POSTs JSON to ${pbUrl}/api/collections/contacts/records
   ├─ i18n/
   │  ├─ en.json / it.json / es.json   # all UI copy as PLACEHOLDER keys (e.g. "EN — hero · headline line 1")
   │  └─ utils.ts              # useTranslations(lang), useTranslatedPath(lang), getLangFromUrl, stripLocale, LOCALES, DEFAULT_LOCALE
   ├─ lib/
   │  ├─ pocketbase.ts         # PocketBase singleton (server-only) + getProjects(locale) / getServices(locale) with seed fallback
   │  └─ seed-data.ts          # structural placeholder data mirroring the PocketBase schema (the seed fallback)
   └─ styles/
      ├─ tokens.css            # design tokens as CSS custom properties (+ [data-theme="dark"] overrides, reduced-motion guard, coarse-pointer hit area)
      └─ app.css               # @import "tailwindcss"; @theme {…}; @font-face; base resets; .md-eyebrow/.md-btn/.md-tag/.md-input/.md-card utilities
```

---

## Routing & i18n

- **Default locale = English**, served at `/` with no prefix. Italian is at
  `/it/`, Spanish at `/es/`. Configured in `astro.config.mjs`:
  `i18n: { defaultLocale: 'en', locales: ['en','it','es'], routing: { prefixDefaultLocale: false } }`.
- Each locale has its own page file (`src/pages/index.astro`,
  `src/pages/it/index.astro`, `src/pages/es/index.astro`); they all render the
  shared `SectionsHome.astro` with their `lang`.
- **All UI copy lives in `src/i18n/{en,it,es}.json`** as placeholder keys —
  e.g. `"hero.headline.line1": "EN — hero · headline line 1"`. Replace these
  with real content; the three files share an identical key tree.
- `src/i18n/utils.ts` exposes:
  - `useTranslations(lang)` → `t('dotted.key')`. Falls back to English, then to
    a visible `⟦key⟧` so missing strings are obvious rather than blank.
  - `useTranslatedPath(lang)` → `path('/contact')` → `/contact` (en) or
    `/it/contact` / `/es/contact`.
  - `getLangFromUrl(url)`, `stripLocale(pathname)`, `LOCALES`, `DEFAULT_LOCALE`.
- **Vue islands cannot read the dictionaries** (they're hydrated client-side).
  Pass the strings they need as props from the `.astro` parent — see
  `Contact.astro` → `ContactForm`, and `BaseLayout.astro` → `Nav`.
- Project and service titles/descriptions are localized at the **data** layer:
  `getProjects(locale)` / `getServices(locale)` flatten `title_${locale}` /
  `desc_${locale}` into `title` / `desc`.

---

## Design tokens & Tailwind v4

- **`src/styles/tokens.css`** is the canonical token surface — brand greens
  (`--brand-50…900`, `--brand-glow`), warm neutrals (`--ink-*`), semantic
  surface variables (`--bg`, `--surface`, `--surface-2/3`, `--line`, `--line-2`,
  `--text`, `--text-2`, `--text-3`, `--brand`, `--brand-hover/press/tint`,
  `--on-brand`, `--focus-ring`, `--danger`), the type scale (`--fs-*` / `--lh-*`),
  spacing (`--sp-*`), radii (`--r-*`, `--r-pill`), shadows, and motion
  (`--ease`, `--dur-*`). The `:root[data-theme="dark"]` block re-points the
  semantic variables; the reduced-motion blanket reset and coarse-pointer
  44 px hit-area rule live here too. **Reference the semantic variables
  directly in components** (`color: var(--text)`, `background: var(--bg)`, …) —
  they flip automatically with the theme.
- **`src/styles/app.css`** does `@import "tailwindcss"`, `@import "./tokens.css"`,
  then a `@theme { … }` block that mirrors the tokens into Tailwind v4's
  generated variables — so utilities like `text-brand-500`, `bg-ink-50`,
  `font-display`, `text-h1`, `rounded-r3`, `shadow-2` are available alongside
  hand-written CSS. It also declares the `@font-face` rules, base resets, and
  the `.md-*` component utility classes (`.md-eyebrow`, `.md-hr`, `.md-btn` &
  variants, `.md-tag`, `.md-input`, `.md-card`, `.md-meta`) ported from the
  design's `tokens.css`.

---

## Dark mode

Source of truth: `document.documentElement.dataset.theme` — `"light"` |
`"dark"`. Behaviour: **system default + manual override**.

1. A small **blocking inline script** in `<head>` (before the stylesheet, in
   `BaseLayout.astro`) sets `data-theme` from `localStorage('miciodev-theme')`,
   or `prefers-color-scheme` if there's no saved choice. Because it runs before
   first paint, there's no flash of the wrong palette.
2. **`ThemeToggle.vue`** (in the nav) flips `data-theme`, persists the choice
   to `localStorage('miciodev-theme')`, and listens for OS scheme changes —
   following the system **only while the user hasn't made a manual choice**.
3. The **footer is hard-coded `#0A0B0A`** in both modes (it never reads `--bg`)
   — it's the page's terminal beat.

---

## Fonts

Self-host three families: **Instrument Serif** (display — italic + roman),
**Geist** (body — 400/500/600), **Geist Mono** (400/500). Until you add the
files, the system fallbacks (`Times New Roman` / `system-ui`) render and
nothing breaks.

1. Download: Instrument Serif from [fonts.google.com](https://fonts.google.com/specimen/Instrument+Serif),
   Geist + Geist Mono from [vercel.com/font](https://vercel.com/font).
2. Subset to Latin (covers en/it/es) with
   [glyphhanger](https://github.com/zachleat/glyphhanger) or `pyftsubset`.
3. Drop the woff2 files into `public/fonts/` with **exactly these names** (also
   listed in `public/fonts/.gitkeep`):
   `instrument-serif-regular.woff2`, `instrument-serif-italic.woff2`,
   `geist-regular.woff2`, `geist-medium.woff2`, `geist-semibold.woff2`,
   `geist-mono-regular.woff2`, `geist-mono-medium.woff2`.
4. `app.css` already declares the `@font-face` rules with `font-display: swap`
   (+ `size-adjust` / `ascent-override` on Geist to minimize layout shift), and
   `BaseLayout.astro` preloads the two critical files
   (`instrument-serif-italic.woff2`, `geist-regular.woff2`).
5. On your host, cache `public/fonts/*` immutably
   (`Cache-Control: public, max-age=31536000, immutable`).

---

## Images & assets

- Optimized images live in **`src/assets/`** and go through `astro:assets`:
  - `logo-miciodev.jpg` — the brand mark (neon cat-on-a-monitor, 600×600). Used
    in the nav (rendered 30 px, served as a 60 px `.webp` via `getImage()` and
    passed to `Nav.vue` as a prop, since framework components can't use
    `<Image>` directly) and in the footer (`<Image>` at 36 px, `densities={[1,2]}`).
  - `hero.webp` — the hero atmosphere photo (1672×941, abstract light tech
    pattern). Rendered in `Hero.astro` via `<Image>` as a full-bleed
    `object-fit: cover` layer, `widths={[640,960,1280,1672]}`, `loading="eager"`,
    `fetchpriority="high"`. It's **light-mode only** — hidden in dark mode, where
    the CSS mesh + dot-grid layers take over (the photo is light-toned).
- `public/` keeps only assets referenced by literal path / not processed:
  `favicon.svg`, `logo.svg` (a simple vector fallback — not the brand JPG),
  `robots.txt`, `fonts/`.
- Per-locale Open Graph images are still TODO at `public/og/{en,it,es}.png` (1200×630).

## Vue islands

| Component | Hydration | Why it needs JS |
|---|---|---|
| `Nav.vue` | `client:load` | Above the fold; mobile drawer open/close, scroll-shadow toggle. Hosts `ThemeToggle` + `LangSwitch` (bundled into the same island). |
| `ThemeToggle.vue` | (child of Nav) | Reads/writes `localStorage` + `data-theme`; OS-change listener. |
| `LangSwitch.vue` | (child of Nav) / `client:visible` in `Footer` | ARIA radiogroup with arrow-key navigation; builds locale-prefixed hrefs that preserve the current path. `variant="dark"` for the footer. |
| `ContactForm.vue` | `client:visible` | Live validation, char counter, `aria-live="polite"` feedback region, honeypot, `fetch` POST to `${pbUrl}/api/collections/contacts/records` (PocketBase). |

Everything else is static `.astro` — zero JavaScript shipped for Hero,
Services, Projects, Skills, the Contact section shell, and the Footer shell.

---

## Data: PocketBase

`src/lib/pocketbase.ts` builds a singleton from `PUBLIC_PB_URL` (read at
**runtime** — `process.env.PUBLIC_PB_URL`, then `import.meta.env` as a dev
fallback) and exposes `getProjects(locale)` and `getServices(locale)`, called
from page/component frontmatter. With `output: 'server'` those run **per
request**, so content is always fresh. If `PUBLIC_PB_URL` is unset or the
request fails, both fall back to `src/lib/seed-data.ts` — so a clean checkout
still renders with no backend. This module is server-only; don't import it from
client components.

Expected collections (full field list in `../README.md` → "PocketBase
collections schema"):

- **`projects`** — `slug` (unique), `idx`, `client`, `period`, `featured`,
  `order`, `title_{en,it,es}`, `desc_{en,it,es}`, `stack` (json string[]),
  `kpis` (json `{label,value}[]`), `cover` (file), `gallery` (file[]),
  `live_url`, `repo_url`. **Public read rule.** The first featured project
  renders as the wide featured card.
- **`services`** — `idx`, `order`, `icon`
  (`stack` | `api` | `vps` | `compass` | `magnifier` → maps to an inline SVG in
  `Services.astro`), `featured`, `title_{en,it,es}`, `desc_{en,it,es}`,
  `tags` (json string[]). **Public read rule.**

Content is re-read on every request (SSR), so no rebuild/webhook is needed when
projects or services change in PocketBase.

---

## Contact form & PocketBase

The form has no Astro API route — `ContactForm.vue` POSTs directly to
PocketBase from the browser.

- **`ContactForm.vue`** — fields `name`, `email`, `subject` (free-text),
  `message`, plus a hidden `website` honeypot. Validates live (all required,
  email format, message 10–2000 chars), shows a character counter, surfaces
  success/error in an `aria-live="polite"` region above the submit button, and
  on submit `fetch`-POSTs `{ name, email, subject, message }` (JSON) to
  `${pbUrl}/api/collections/contacts/records`, where `pbUrl` is `PUBLIC_PB_URL`
  (passed in as a prop by `Contact.astro`, read at request time). A filled
  honeypot short-circuits to a fake success and sends nothing. On failure it
  shows a generic message only (`contact.form.error` / `contact.form.errors.rateLimit`
  for 429) — PocketBase's response body is never surfaced. No `console.log` of
  form data.
- **PocketBase `contacts` collection** (`../pb/pb_migrations/…_created_contacts.js`)
  — `createRule = ""` (public), everything else admin-only. Field constraints
  (min/max) are enforced server-side by PocketBase. Submissions are read in the
  admin dashboard at `${PUBLIC_PB_URL}/_/`. Enable PocketBase rate limiting
  (Settings → Rate limits) on `POST /api/collections/contacts/records`.

---

## SEO & sitemap

`BaseLayout.astro` accepts `lang`, optional `title`, optional `description`
(defaults pulled from `meta.title` / `meta.description` in the i18n files) and
renders: `<html lang>`, `<title>`, `<meta name="description">`,
`<link rel="canonical">`, the `hreflang` triplet (`en` / `it` / `es`) plus
`x-default`, Open Graph + Twitter card tags (image referenced at
`/og/{lang}.png` — 1200×630, generate per locale), and `<link rel="icon">`.
`@astrojs/sitemap` is enabled, so `sitemap-index.xml` is emitted on build;
`public/robots.txt` allows all and points at it.

---

## Accessibility

- One `<h1>` per page (Hero), `<h2>` per section, `<h3>` inside cards.
- Skip-to-content link as the first element in `<body>` (`.skip-link`,
  visible on focus).
- Visible `<label>` above every form field; errors announced via `role="alert"`;
  submit feedback in an `aria-live="polite"` region.
- Focus ring (`--shadow-focus`, 3 px) on every interactive element.
- `LangSwitch` is an ARIA radiogroup with arrow-key / Home / End navigation.
- `prefers-reduced-motion: reduce` disables animations and transitions globally
  (blanket reset in `tokens.css`).
- Touch targets ≥ 44 × 44 px on coarse pointers (CSS media query in `tokens.css`).
- Contrast meets WCAG AA in both themes (brand ~7.4 : 1 light, ~9.1 : 1 dark
  per the design handoff).

---

## Building & deploying

```bash
npm run build
# → dist/client/   static assets (+ sitemap, robots, any prerendered pages)
# → dist/server/   entry.mjs — the SSR Node server (standalone; also serves dist/client)

# run the server entry yourself (set PUBLIC_PB_URL / SITE_URL in the env first):
node ./dist/server/entry.mjs
# or:
npm run preview
```

The repo ships a `Dockerfile` (multi-stage → `node:20-alpine` running the
standalone server) and `../docker-compose*.yml`. For a managed platform,
replace `@astrojs/node` in `astro.config.mjs` with the matching adapter (e.g.
`npm run astro -- add vercel` / `npm run astro -- add cloudflare`) and set
`PUBLIC_PB_URL` and `SITE_URL` in the platform's env settings. Aim for
Lighthouse 100 / 100 / 100 / 100 on the `/` route before launching the others.

---

## Troubleshooting

- **`NoAdapterInstalled` on build** — `output: 'server'` needs an adapter.
  `@astrojs/node` is already configured; just make sure `npm install` ran.
- **`Cannot find module 'astro' / '@astrojs/vue' / …`** — run `npm install`;
  the scaffold ships `package.json` only.
- **Theme flashes on load** — the bootstrap script must stay in `<head>` before
  the stylesheet `<link>` and run as `is:inline` (it does in `BaseLayout.astro`).
- **Type errors on `import.meta.env.PUBLIC_PB_URL`** — the variable typings live
  in `src/env.d.ts`; add new vars there too.
- **Contact form posts to the wrong host** — `PUBLIC_PB_URL` is read at runtime
  (`process.env` on the SSR server, then passed to the form as a prop). In
  Docker it comes from the container's `environment:` block; for `astro dev`
  set it in `astro/.env`. It must be reachable from the **browser**.
- **Build fails fetching PocketBase** — it shouldn't (it falls back to seed
  data and logs a warning). If you *want* the build to hard-fail when PB is
  down, throw instead of warning in `getProjects` / `getServices`.
- **`@tailwindcss/vite` not applying styles** — ensure `app.css` is imported
  (it is, from `BaseLayout.astro`) and that `tailwindcss()` is in
  `astro.config.mjs` → `vite.plugins`.

---

## Roadmap / TODO

- [ ] Replace the placeholder keys in `src/i18n/{en,it,es}.json` with real copy.
- [ ] Stand up PocketBase locally, create the `projects` + `services`
      collections (public read rule), seed them, point `PUBLIC_PB_URL` at it.
      (The `contacts` collection is created by `pb/pb_migrations/`.)
- [ ] Add the self-hosted, subsetted woff2 font files to `public/fonts/`.
- [ ] Build `src/pages/projects/[slug].astro` case-study detail pages
      (`getStaticPaths` over `getProjects`).
- [ ] Generate per-locale Open Graph images at `public/og/{en,it,es}.png` (1200×630).
- [ ] Wire the projects filter bar (currently static placeholder controls).
- [ ] Pick the production hosting adapter; set env vars; configure immutable
      caching for `/fonts/*`.
- [ ] (Optional) Persist contact submissions to a PocketBase `messages`
      collection as a backup (`PB_ADMIN_TOKEN`).
- [ ] Lighthouse + axe pass; target 100 across the board on `/`.
