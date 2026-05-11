# Handoff: MicioDev Portfolio

> Senior freelance full-stack developer portfolio. Italian agencies & SaaS as primary audience. Trilingual (IT / EN / ES), light + dark, mobile-first.

---

## About the design files

The files in `design_refs/` are **design references created in HTML**. They are prototypes that show intended look, layout, type, color, motion intent, and component states — **not production code to copy directly**.

Your task: recreate them in the target stack (Astro 5 + Vue 3 islands + Tailwind v4 + PocketBase + Resend), using that stack's idioms. Don't port React/JSX 1:1. Lift values (hex, rem, px, easing) and structural decisions; rebuild components in Vue.

## Fidelity

**High-fidelity.** All colors, type, spacing, radii, shadows, and motion timings are final. Every section has light + dark + mobile artboards. Section transitions, focus states, hover states, error/success form states, and the reduced-motion guard are all specified.

## Target stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro 5 | Static-first. One route per language: `/`, `/en/`, `/es/` (default IT) — or use built-in Astro i18n |
| Interactive islands | Vue 3 | `client:visible` for form, nav, theme toggle; `client:load` only for nav |
| Styling | Tailwind v4 | `@theme` block in `app.css`; tokens below map 1:1 to Tailwind variables |
| i18n | Astro built-in i18n | `astro.config.mjs` `i18n: { defaultLocale: 'it', locales: ['it','en','es'] }`. astro-i18next is an alternative if you want runtime translations |
| Data | PocketBase | REST: `GET /api/collections/projects/records`, `services/records`. Per-request fetch in Astro (SSR) — always fresh, no rebuild |
| Contact | PocketBase | The Vue island POSTs straight to `POST /api/collections/contacts/records`. Honeypot (client-side) + PocketBase built-in rate limiting. No email service. |

---

## Design tokens (drop into `src/styles/app.css`)

Tailwind v4 reads `@theme` directly. The token file `design_refs/tokens.css` is the source of truth — copy values into `@theme`. Excerpt:

```css
@import "tailwindcss";

@theme {
  /* Brand — sage emerald. Never lime. */
  --color-brand-50:  #EAF3ED;
  --color-brand-100: #CFE3D5;
  --color-brand-200: #9CC8AA;
  --color-brand-300: #5FA577;
  --color-brand-400: #2F8556;
  --color-brand-500: #1F6E4A;   /* primary, light */
  --color-brand-600: #15533A;   /* hover */
  --color-brand-700: #0E3F2C;   /* press */
  --color-brand-800: #0A3424;
  --color-brand-900: #052017;
  --color-brand-glow: #3FB07A;  /* primary, dark — phosphor */

  /* Warm neutrals */
  --color-ink-0:   #FFFFFF;
  --color-ink-50:  #FAFAF7;
  --color-ink-100: #F4F4EF;
  --color-ink-150: #EDEDE7;
  --color-ink-200: #E2E2DA;
  --color-ink-300: #CECEC4;
  --color-ink-400: #9A9A8F;
  --color-ink-500: #6E6E64;
  --color-ink-600: #4A4A42;
  --color-ink-700: #2A2A25;
  --color-ink-900: #0E0E0C;
  --color-ink-950: #070706;

  --color-danger:   #B4321F; /* light */
  /* dark mode uses #E36D58 — see :root[data-theme="dark"] below */

  /* Type */
  --font-display: "Instrument Serif", "Times New Roman", serif;
  --font-body:    "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono:    "Geist Mono", ui-monospace, "JetBrains Mono", monospace;

  --text-d2: 88px; --text-d1: 64px;
  --text-h1: 44px; --text-h2: 32px; --text-h3: 24px; --text-h4: 18px;
  --text-bl: 18px; --text-b: 15px; --text-s: 13px; --text-m: 11px;

  /* Spacing (4 px base) */
  --spacing-1: 4px;  --spacing-2: 8px;  --spacing-3: 12px; --spacing-4: 16px;
  --spacing-5: 24px; --spacing-6: 32px; --spacing-7: 48px; --spacing-8: 64px;
  --spacing-9: 96px; --spacing-10: 128px;

  /* Radii / shadow / motion */
  --radius-1: 2px; --radius-2: 4px; --radius-3: 8px; --radius-4: 14px;
  --shadow-1: 0 1px 0 rgb(14 14 12 / .04), 0 1px 2px rgb(14 14 12 / .04);
  --shadow-2: 0 1px 0 rgb(14 14 12 / .04), 0 6px 18px rgb(14 14 12 / .06);
  --shadow-3: 0 12px 36px rgb(14 14 12 / .10);
  --ease: cubic-bezier(.2,.7,.3,1);
}

/* Semantic surface vars — swap on data-theme */
:root {
  --bg: var(--color-ink-50);
  --surface: var(--color-ink-0);
  --line: var(--color-ink-200);
  --text: var(--color-ink-900);
  --text-2: var(--color-ink-600);
  --text-3: var(--color-ink-500);
  --brand: var(--color-brand-500);
  --on-brand: var(--color-ink-0);
}
:root[data-theme="dark"] {
  --bg: var(--color-ink-950);
  --surface: var(--color-ink-900);
  --line: #232321;
  --text: #F1F1EA;
  --text-2: #B7B7AC;
  --text-3: #80807A;
  --brand: var(--color-brand-glow);
  --on-brand: #062014;
}

/* WCAG hit-area + reduced motion */
@media (pointer: coarse) {
  button[aria-label], [role="group"] button { min-height: 44px; min-width: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

---

## Project structure

```
src/
├─ pages/
│  ├─ index.astro            # IT (default)
│  ├─ en/index.astro
│  ├─ es/index.astro
│  └─ projects/[slug].astro  # case-study detail
├─ layouts/
│  └─ Base.astro             # html lang, meta, font preload, theme bootstrap, Nav, Footer slot
├─ components/
│  ├─ astro/                 # static, no JS shipped
│  │  ├─ Hero.astro
│  │  ├─ Services.astro
│  │  ├─ Projects.astro
│  │  ├─ Skills.astro
│  │  ├─ SectionDivider.astro
│  │  └─ Footer.astro
│  └─ vue/                   # interactive islands
│     ├─ Nav.vue             # mobile drawer + theme toggle + lang switch
│     ├─ ThemeToggle.vue
│     ├─ LangSwitch.vue
│     └─ ContactForm.vue     # validation + direct POST to PocketBase + aria-live feedback
├─ i18n/
│  ├─ it.json
│  ├─ en.json
│  └─ es.json
├─ lib/
│  ├─ pocketbase.ts          # build-time fetch helpers
│  └─ contrast.ts            # optional: theme bootstrap helper
└─ styles/
   └─ app.css                # @theme + base resets
```

---

## Component breakdown (Vue islands vs. Astro static)

| Component | Type | Notes |
|---|---|---|
| **Nav** | Vue island | Needs reactive state for mobile drawer open, scroll-shadow toggle, theme + lang switch. `client:load` (above-fold). Sticky w/ `backdrop-filter: blur(8px)`. |
| **ThemeToggle** | Vue island (child of Nav) | Reads/writes `localStorage.theme` + `document.documentElement.dataset.theme`. See "Dark mode" below. |
| **LangSwitch** | Vue island (child of Nav) | ARIA radiogroup, arrow-key nav. Routes to `/`, `/en/`, `/es/` preserving the current path. |
| Hero | Astro static | Atmosphere (radial mesh + dot grid mask + SVG grain) is pure CSS/SVG. CTAs are `<a>` not Vue. |
| Services | Astro static | Card grid; data from PocketBase at build. Icons are inline SVG (`design_refs/services.jsx` has the 5 line icons). |
| Projects | Astro static | Featured + grid. Data from PocketBase. Hover state = CSS only. |
| Skills | Astro static | Pure list. No JS. Three pill weights: `primary` / `daily` / `default` — class-driven. |
| **ContactForm** | Vue island | `client:visible`. Live validation, char counter, `aria-live="polite"` region for submit feedback, honeypot field, POSTs to `${PUBLIC_PB_URL}/api/collections/contacts/records`. |
| Footer | Astro static | Always-dark surface. Social icons inline SVG. Lang switch is a duplicate of Nav's — extract `LangSwitch.vue` once. |
| SectionDivider | Astro static | The `§ NN — name` hairline between sections. Aria-hidden. |

---

## PocketBase collections schema

### `projects`
| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | text (unique) | ✓ | URL slug, lowercased, no spaces |
| `idx` | text | ✓ | Display index, e.g. `"01"` |
| `client` | text | ✓ | e.g. `"Atelier Nove"` |
| `period` | text | ✓ | e.g. `"2024 — ongoing"` |
| `featured` | bool | ✓ | One featured at a time recommended |
| `order` | number | ✓ | Manual sort (lower = first) |
| `title_it` / `title_en` / `title_es` | text | ✓ | Per-locale title |
| `desc_it` / `desc_en` / `desc_es` | text (long) | ✓ | Per-locale description |
| `stack` | json | ✓ | Array of strings: `["Laravel","Vue","Nuxt","Stripe"]` |
| `kpis` | json | – | Array of `{ label, value }` for featured cards |
| `cover` | file (image) | ✓ | 16:10 hero shot |
| `gallery` | file (multi) | – | Case-study detail images |
| `live_url` | url | – | External link |
| `repo_url` | url | – | If public |

### `services`
| Field | Type | Required | Notes |
|---|---|---|---|
| `idx` | text | ✓ | `"01"`–`"05"` |
| `order` | number | ✓ | |
| `icon` | select | ✓ | One of `stack`/`api`/`vps`/`compass`/`magnifier` — maps to inline SVG, not stored |
| `title_it` / `title_en` / `title_es` | text | ✓ | |
| `desc_it` / `desc_en` / `desc_es` | text (long) | ✓ | |
| `tags` | json | – | e.g. `["Laravel","Nuxt"]` |
| `featured` | bool | – | Renders as wide card (positions 4–5 in the 5-card layout) |

### Fetch pattern (build-time)

```ts
// src/lib/pocketbase.ts
const PB = import.meta.env.PB_URL; // e.g. https://pb.miciodev.com
export async function getProjects(locale: 'it'|'en'|'es') {
  const r = await fetch(`${PB}/api/collections/projects/records?sort=+order&perPage=50`);
  const { items } = await r.json();
  return items.map(p => ({
    ...p,
    title: p[`title_${locale}`],
    desc:  p[`desc_${locale}`],
  }));
}
```

Use Astro's `export const prerender = true` and fetch in the page's frontmatter. Set up a webhook from PocketBase → trigger rebuild on collection change (Cloudflare Pages / Vercel hook URL).

---

## Dark mode

The design supports **system default + manual override**. Source of truth: `document.documentElement.dataset.theme` (`"light"` | `"dark"` | unset = follow system).

**Bootstrap (inline in `<head>`, blocking, no flash):**

```html
<script>
  (function () {
    var saved = localStorage.getItem('miciodev-theme');
    var sys = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = saved || sys;
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
  })();
</script>
```

Place this **before** the CSS link — it sets `data-theme` before paint so the user never sees a flash of the wrong palette.

**ThemeToggle.vue (sketch):**

```vue
<script setup>
import { ref, onMounted } from 'vue';
const dark = ref(false);
onMounted(() => { dark.value = document.documentElement.dataset.theme === 'dark'; });
function toggle() {
  dark.value = !dark.value;
  document.documentElement.dataset.theme = dark.value ? 'dark' : 'light';
  localStorage.setItem('miciodev-theme', dark.value ? 'dark' : 'light');
}
// Optional: listen to system change when user hasn't manually set
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('miciodev-theme')) {
    dark.value = e.matches;
    document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
  }
});
</script>
```

**Footer stays dark in both modes** — hard-code its background to `#0A0B0A` and don't read from `--bg`.

---

## Font loading strategy

Two fonts — **Instrument Serif** (display, italic + roman) and **Geist** + **Geist Mono** (body & code accents). Performance first:

1. **Self-host.** Don't use Google Fonts CDN — it adds a third-party round trip. Download woff2 files from `fonts.google.com` or `vercel.com/font` (Geist) and put them in `public/fonts/`.

2. **Subset to the languages you ship.** Use [glyphhanger](https://github.com/zachleat/glyphhanger) or fonttools `pyftsubset` to keep only Latin (covers IT/EN/ES). Cuts each weight ~70%.

3. **Preload the two critical files only** (display italic + body regular):

   ```html
   <link rel="preload" href="/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="preload" href="/fonts/geist-regular.woff2"          as="font" type="font/woff2" crossorigin>
   ```

4. **`font-display: swap`** on every `@font-face`. The system fallback (`Times New Roman` / `system-ui`) renders immediately; webfont swaps in when ready.

5. **Size-adjust + ascent-override** to minimize layout shift when the swap happens:

   ```css
   @font-face {
     font-family: "Geist";
     src: url("/fonts/geist-regular.woff2") format("woff2");
     font-weight: 400; font-display: swap;
     size-adjust: 100%; ascent-override: 92%;
   }
   ```

6. **Mono is non-critical** — let it load late. Don't preload Geist Mono.

7. **HTTP-cache** fonts immutably (1 year, `cache-control: public, max-age=31536000, immutable`) — add to your hosting headers config.

Expected outcome: text is paint-blocked for < 50 ms, italic display swaps in by ~200 ms on a fast connection, no perceptible CLS.

---

## Contact form

- `ContactForm.vue` POSTs JSON `{ name, email, subject, message }` straight to
  `${PUBLIC_PB_URL}/api/collections/contacts/records` from the browser — no Astro
  API route. Submissions land in the PocketBase `contacts` collection; read them
  in the admin dashboard at `${PUBLIC_PB_URL}/_/`.
- Fields: `name`, `email`, `subject` (free-text), `message`, plus a honeypot
  `website` field that must be empty (a filled honeypot short-circuits to a fake
  success and sends nothing).
- Client-side validation: all required, email format, message length 10–2000.
  PocketBase re-enforces the same bounds server-side via the collection schema.
- Spam: enable PocketBase rate limiting (Settings → Rate limits) on
  `POST /api/collections/contacts/records`.
- On failure the form shows a generic message only — PocketBase's response body
  is never surfaced. Success/error appear in an `aria-live="polite"` region
  above the submit button.
- Environment: `PUBLIC_PB_URL` (runtime).

---

## Sections & layout reference

Open `design_refs/FullPage.html` (desktop, light + dark) and `design_refs/Mobile.html` (390 px) for the canonical visual reference. Section heights:

| § | Section | Desktop pad | Mobile pad | Notes |
|---|---|---|---|---|
| 01 | Hero | 0 (full-bleed) | 0 | atmospheric mesh + grain; H1 only here |
| 02 | Services | 96 v · 64 h | 56 v · 22 h | 3-col + 2-wide |
| 03 | Projects | 96 v · 64 h | 56 v · 22 h | 1 featured + 4 grid |
| 04 | Skills | 96 v · 64 h | 56 v · 22 h | 4 group columns |
| 05 | Contact | 120 v · 64 h | 64 v · 22 h | form left, aside right |
| – | Footer | 88 v · 64 h | 56 v · 22 h | always dark |

Section dividers: a 1 px hairline + mono `§ NN — name` label in the gutter. **No** hard borders.

---

## Accessibility checklist (already passes / to verify in your build)

- [x] One H1 per page · H2 per section · H3 inside cards
- [x] Form `<label htmlFor>` always visible above input — never placeholder-as-label
- [x] Focus ring on every interactive element (3 px `--focus-ring`)
- [x] Color contrast ≥ AA in both modes (brand 7.4 : 1 light, 9.1 : 1 dark)
- [x] `prefers-reduced-motion` honored (blanket reset in `tokens.css`)
- [x] Touch targets ≥ 44 × 44 on coarse pointers (CSS media query)
- [ ] `aria-live="polite"` on form feedback region (add in Vue island)
- [ ] LangSwitch keyboard arrow-key nav (ARIA radiogroup pattern)
- [ ] Skip-to-content link in `<body>` first child

---

## SEO checklist

- `<html lang="…">` set per route
- Per-route `<title>` and `<meta name="description">` from i18n JSON
- `<link rel="alternate" hreflang>` triplet on every page
- Open Graph + Twitter card images at 1200×630 (generate from the hero per-locale)
- `sitemap.xml` via `@astrojs/sitemap`
- `robots.txt` allowing all

---

## Files in this bundle

```
design_handoff_miciodev_portfolio/
├─ README.md                     ← this file
└─ design_refs/
   ├─ Foundations.html           ← color tokens, type scale, components
   ├─ Hero.html                  ← hero composition + animation spec
   ├─ Services.html               ← 5-service grid + icons
   ├─ Projects.html               ← featured + grid + hover state
   ├─ Skills.html                 ← 4-group pill cloud
   ├─ Contact.html                ← form (default/error/success) + dark footer
   ├─ FullPage.html               ← full assembly · light + dark · 1440
   ├─ Mobile.html                 ← full assembly · 390 · light + dark · a11y audit
   ├─ tokens.css                  ← canonical token source
   ├─ nav-card.jsx                ← Nav (desktop + mobile drawer) reference
   ├─ hero.jsx                    ← Hero composition reference
   ├─ services.jsx                ← Services + the 5 line icons
   ├─ projects-section.jsx        ← Projects layout
   ├─ projects-cards.jsx          ← Featured + grid card markup
   ├─ projects-data.js            ← Placeholder data shape — model PocketBase off this
   ├─ skills.jsx                  ← Pill weights + groups
   ├─ contact-footer.jsx          ← Form + dark footer
   ├─ full-page.jsx               ← Desktop section stacking
   └─ full-mobile.jsx             ← Mobile section stacking
```

JSX files are **references for layout and intent**, not files to port directly. Read them, lift values, rebuild in `.vue` and `.astro`.

---

## Implementation order suggestion

1. Scaffold Astro + Vue + Tailwind v4 + i18n routes (no content yet).
2. Drop tokens into `app.css`; verify light/dark surfaces via a sandbox page.
3. Load fonts (self-host, subset, preload critical two).
4. Build Nav.vue + ThemeToggle.vue + LangSwitch.vue. Verify theme bootstrap doesn't flash.
5. Build Hero, Services, Skills as Astro static — content from i18n JSON (no PocketBase yet).
6. Stand up PocketBase locally with `projects` and `services` collections; seed with the placeholder data in `projects-data.js`.
7. Wire build-time fetch helpers; swap Services + Projects to read from PocketBase.
8. Build ContactForm.vue posting directly to the PocketBase `contacts` collection.
9. Footer.
10. SEO + sitemap + analytics (Plausible recommended).
11. Lighthouse + axe pass.

Aim for Lighthouse 100 / 100 / 100 / 100 on the IT landing page before launching the others.

---

# Repository layout, build & deploy

> The portfolio is split into two services. CI runs on every PR; merges to
> `develop` deploy to staging and merges to `main` deploy to production
> (git-flow). Images are built and pushed to GitHub Container Registry, then a
> short SSH step rolls the stack on the VPS.
>
> The Astro app runs **SSR** (`output: 'server'`), so every page re-reads
> PocketBase on each request — content (projects, services) is live without a
> redeploy. The contact form POSTs straight from the browser to PocketBase's
> REST API; submissions land in a `contacts` collection the admin reads at
> `pb.micio86dev.it/_/`. No email service is involved.

```
portfolio/
├── astro/                      Astro 5 SSR frontend (@astrojs/node standalone server)
│   ├── Dockerfile              multi-stage: node build → node:20-alpine standalone runtime
│   └── .dockerignore
├── pb/                         PocketBase backend
│   ├── Dockerfile              debian:bookworm-slim; downloads the pinned PB linux release
│   ├── pb_migrations/          versioned schema migrations — committed, auto-applied on start
│   ├── pocketbase              local (macOS) binary — gitignored
│   └── pb_data/                SQLite data — gitignored
├── docker-compose.yml          local dev (builds from source)
├── docker-compose.prod.yml     production (GHCR :latest, ports 3000/8090) — also the base for stage
├── docker-compose.stage.yml    staging overrides (GHCR :develop, ports 3001/8091)
├── nginx/portfolio.conf        host-nginx reverse proxy (reference copy; deploy to the VPS)
└── .github/workflows/
    ├── ci.yml                  PR → astro check + build
    ├── deploy-stage.yml        push develop → build/push :develop → SSH deploy staging
    └── deploy-prod.yml         push main    → build/push :latest  → SSH deploy production
```

## Why a Node container (not nginx-static)

The app is SSR (`output: 'server'` + `@astrojs/node` standalone). The runtime
image runs `node ./dist/server/entry.mjs`, which renders pages on demand **and**
serves the static client assets (`dist/client`). Host nginx sits in front for
TLS, gzip, security headers, and asset caching, and exposes PocketBase on a
`pb.` subdomain.

## Configuration: build-time vs runtime

| Variable | When | Where it comes from |
|---|---|---|
| `PUBLIC_PB_URL` | **runtime** — read by the SSR server (`process.env`) for projects/services, and by the browser for the contact-form POST | container `environment:` in `docker-compose.{prod,stage}.yml`, interpolated from `${PROD_PB_URL}` / `${STAGE_PB_URL}` in the VPS `.env` (written by the deploy workflow from the repo secret). Falls back to `http://localhost:8090`. **Not** a build arg. |
| `SITE_URL` | build — canonical / hreflang / sitemap | Docker build arg ← hardcoded per env in the deploy workflow |

Because the contact form runs in the browser, `PUBLIC_PB_URL` must be a URL the
browser can reach (e.g. `https://pb.micio86dev.it`). PocketBase serves
permissive CORS on `/api/*`, so the cross-subdomain POST from the site works.

## Local development

```bash
docker compose up --build
# site:        http://localhost:4321
# PocketBase:  http://localhost:8090/_/   (create the first superuser here)
```

`docker-compose.yml` hardcodes `PUBLIC_PB_URL=http://localhost:8090` (browser-
reachable via the port map). Inside the astro container, SSR-side fetches resolve
`localhost` to the container itself, so projects/services fall back to seed data;
for live local PocketBase data in SSR run `npm run dev` in `astro/` on the host
(it reads `astro/.env`).

## VPS layout

Two independent stacks, one directory each. Each holds a `.env` (just the
PocketBase URL — written by the deploy workflow from the `PROD_PB_URL` /
`STAGE_PB_URL` repo secret; not a real secret, but never committed) and a
`pb_data/` directory the PocketBase container mounts. The deploy workflows
`scp` the compose files in on every run, so they stay in sync with the repo.

```
/var/www/portfolio/            ← production  (compose: -f docker-compose.prod.yml)
├── .env                       ← PROD_PB_URL=https://pb.micio86dev.it   (CI writes this)
├── pb_data/                   ← chown to uid 1001 (the container's pocketbase user)
└── docker-compose.prod.yml

/var/www/portfolio-stage/      ← staging     (compose: -f docker-compose.prod.yml -f docker-compose.stage.yml)
├── .env                       ← STAGE_PB_URL=https://pb.stage.micio86dev.it   (CI writes this)
├── pb_data/
├── docker-compose.prod.yml
└── docker-compose.stage.yml
```

```bash
# one-time per stack, on the VPS:
sudo mkdir -p /var/www/portfolio/pb_data
sudo chown -R 1001:1001 /var/www/portfolio/pb_data
# .env is created by the first deploy; nothing to paste by hand.
```

Host nginx: copy `nginx/portfolio.conf` → `/etc/nginx/sites-available/portfolio`,
symlink into `sites-enabled/`, `nginx -t && systemctl reload nginx`, then run
Certbot:

```bash
certbot --nginx -d micio86dev.it -d www.micio86dev.it \
                -d stage.micio86dev.it \
                -d pb.micio86dev.it -d pb.stage.micio86dev.it
```

## PocketBase: `contacts` collection & migrations

Schema changes are versioned as migration files under `pb/pb_migrations/`
(committed). PocketBase auto-applies pending migrations on startup, and the
deploy workflows also run `pocketbase migrate up` after each release. The
initial migration `…_created_contacts.js` creates the `contacts` collection:

- fields: `name` (2–100), `email`, `subject` (≤200), `message` (10–2000),
  `read` (bool), `ip` (text)
- API rules: `createRule = ""` (public — anyone can submit); `list` / `view` /
  `update` / `delete` require an authenticated admin (`@request.auth.id != ""`)

Submissions land here; read and mark them in the admin dashboard at
`https://pb.micio86dev.it/_/`. There is no email delivery. **Spam:** enable
PocketBase's built-in rate limiting (Settings → Rate limits) with a rule on
`POST /api/collections/contacts/records`; the form also carries a `website`
honeypot dropped client-side.

To add more schema changes later: edit collections in the admin UI with the
server running with `--dev` (auto-generates a migration file), or run
`./pocketbase migrate collections` to snapshot the current schema, then commit
the new file in `pb/pb_migrations/`.

## ESLint

Not configured yet. Once a `lint` script is added to `astro/package.json`,
uncomment the lint step in `.github/workflows/ci.yml`.

---

## GitHub Actions Secrets Setup

Add these under **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Description | Example format | Used in |
|---|---|---|---|
| `VPS_SSH_PRIVATE_KEY` | ED25519 **private** key the workflows use to SSH into the VPS | `-----BEGIN OPENSSH PRIVATE KEY-----`<br>`b3BlbnNzaC1rZXkt...`<br>`-----END OPENSSH PRIVATE KEY-----` | deploy-stage, deploy-prod |
| `VPS_SSH_HOST` | VPS IP address or hostname | `203.0.113.10` or `vps.micio86dev.it` | deploy-stage, deploy-prod |
| `VPS_SSH_USER` | SSH user on the VPS (a dedicated low-privilege deploy user, in the `docker` group) | `deploy` | deploy-stage, deploy-prod |
| `STAGE_PB_URL` | Runtime URL of the staging PocketBase. The deploy workflow writes it into `/var/www/portfolio-stage/.env`; `docker-compose.stage.yml` injects it as the astro container's `PUBLIC_PB_URL` at start — **not** at build time. | `https://pb.stage.micio86dev.it` | deploy-stage |
| `PROD_PB_URL` | Runtime URL of the production PocketBase. The deploy workflow writes it into `/var/www/portfolio/.env`; `docker-compose.prod.yml` injects it as the astro container's `PUBLIC_PB_URL` at start — **not** at build time. | `https://pb.micio86dev.it` | deploy-prod |

These are public hostnames, not secrets — they're stored as repo secrets only so
the deploy workflow can drop them onto the VPS without anyone editing files
there. Contact-form submissions are stored in the PocketBase `contacts`
collection, viewable in the admin dashboard at `/_/` — no email service, so
there are no Resend / SMTP credentials anywhere.

**`GITHUB_TOKEN` is automatic** — the deploy workflows log in to `ghcr.io` with
the built-in `${{ secrets.GITHUB_TOKEN }}` (`permissions: packages: write`). No
PAT to create or store.

### Generating the CI SSH key

```bash
# on your machine — no passphrase (CI can't type one)
ssh-keygen -t ed25519 -C "github-actions-portfolio" -f ./ci_ed25519

# install the PUBLIC key on the VPS, for the deploy user
ssh-copy-id -i ./ci_ed25519.pub deploy@<VPS_HOST>
#   …or append ci_ed25519.pub to /home/deploy/.ssh/authorized_keys manually

# put the PRIVATE key (the whole file, including the BEGIN/END lines) into the
# VPS_SSH_PRIVATE_KEY secret, then delete ci_ed25519 locally
```

The deploy workflows connect with `StrictHostKeyChecking=accept-new` (trust on
first use). The key is loaded into an ssh-agent via `webfactory/ssh-agent` — it
is never written to disk in the runner and never printed.

### Workflow permissions

`ci.yml` runs with `contents: read` only. `deploy-stage.yml` / `deploy-prod.yml`
add `packages: write` (for the GHCR push) and nothing else. Every job has
`timeout-minutes: 10`. No `curl | bash`, no secret echoed in any `run` step.
