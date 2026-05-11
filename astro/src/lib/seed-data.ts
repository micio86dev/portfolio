/**
 * Fallback data for the PocketBase-backed content (Services, Projects, Skills,
 * News, Customers).
 *
 * Shapes mirror the PocketBase collections created in `pb/pb_migrations/` so
 * swapping to live data is a drop-in. Used by src/lib/pocketbase.ts whenever
 * PUBLIC_PB_URL is unset or the instance is unreachable, so the site still
 * renders. (The UI *strings* — meta, nav, hero, footer, … — have their own
 * fallback: the bundled `src/i18n/*.json`, overlaid by the `translations`
 * collection at runtime.)
 *
 * The service copy here mirrors the `services.items.*` strings in the i18n
 * files. Project titles/descriptions are deliberately generic — the real
 * case-study content lives in PocketBase. News & Customers fall back to empty
 * arrays (their historical content is loaded by a migration).
 */

import type { Locale } from '../i18n/utils';

/** Icon keys map to the inline line-icon set in components/astro/Services.astro. */
export type ServiceIcon = 'stack' | 'api' | 'vps' | 'compass' | 'magnifier';

export interface ServiceRecord {
  id: string;
  idx: string;
  order: number;
  icon: ServiceIcon;
  featured: boolean;
  title_en: string;
  title_it: string;
  title_es: string;
  desc_en: string;
  desc_it: string;
  desc_es: string;
  tags: string[];
}

export interface ProjectRecord {
  id: string;
  slug: string;
  idx: string;
  client: string;
  clientInitials: string;
  period: string;
  featured: boolean;
  order: number;
  title_en: string;
  title_it: string;
  title_es: string;
  desc_en: string;
  desc_it: string;
  desc_es: string;
  stack: string[];
  kpis: { label: string; value: string }[];
  live_url: string;
  repo_url: string;
}

/** Resolved record with the locale-specific `title` / `desc` flattened in. */
export type Localized<T extends { [K in `title_${Locale}` | `desc_${Locale}`]: string }> =
  Omit<T, `title_${Locale}` | `desc_${Locale}`> & { title: string; desc: string };

export const SERVICES_SEED: ServiceRecord[] = [
  {
    id: 'seed-svc-01', idx: '01', order: 1, icon: 'stack', featured: false,
    title_en: 'Full-stack web development',
    title_it: 'Sviluppo web full-stack',
    title_es: 'Desarrollo web full-stack',
    desc_en: 'Laravel back end, Vue or Nuxt front end — one developer across the whole stack. From the first commit to a deploy you can trust.',
    desc_it: 'Back end Laravel, front end Vue o Nuxt — un solo sviluppatore su tutto lo stack. Dal primo commit a un deploy di cui ti puoi fidare.',
    desc_es: 'Back end en Laravel, front end en Vue o Nuxt — un solo desarrollador en todo el stack. Del primer commit a un despliegue en el que puedes confiar.',
    tags: ['Laravel', 'Vue', 'Nuxt'],
  },
  {
    id: 'seed-svc-02', idx: '02', order: 2, icon: 'api', featured: false,
    title_en: 'API design & backend architecture',
    title_it: 'Progettazione API e architettura backend',
    title_es: 'Diseño de APIs y arquitectura backend',
    desc_en: 'REST and GraphQL APIs built to be consumed: versioned, documented, tested. Data models that hold up when the product grows.',
    desc_it: 'API REST e GraphQL pensate per essere consumate: versionate, documentate, testate. Modelli dati che reggono quando il prodotto cresce.',
    desc_es: 'APIs REST y GraphQL pensadas para consumirse: versionadas, documentadas, con tests. Modelos de datos que aguantan cuando el producto crece.',
    tags: ['REST', 'GraphQL'],
  },
  {
    id: 'seed-svc-03', idx: '03', order: 3, icon: 'vps', featured: false,
    title_en: 'VPS infrastructure & DevOps',
    title_it: 'Infrastruttura VPS e DevOps',
    title_es: 'Infraestructura VPS y DevOps',
    desc_en: 'Provisioning, deploys, monitoring and backups on your own servers. CI/CD that ships on green — not on hope.',
    desc_it: 'Provisioning, deploy, monitoraggio e backup sui tuoi server. CI/CD che rilascia quando è tutto verde — non per scommessa.',
    desc_es: 'Aprovisionamiento, despliegues, monitorización y backups en tus propios servidores. CI/CD que publica en verde — no a base de suerte.',
    tags: ['Linux', 'CI/CD'],
  },
  {
    id: 'seed-svc-04', idx: '04', order: 4, icon: 'compass', featured: true,
    title_en: 'Technical consulting for agencies',
    title_it: 'Consulenza tecnica per agenzie',
    title_es: 'Consultoría técnica para agencias',
    desc_en: 'A senior pair of hands for scoping, estimates and architecture calls. White-label, on your timeline.',
    desc_it: 'Una mano senior per scoping, stime e scelte di architettura. White-label, sui tuoi tempi.',
    desc_es: 'Un par de manos sénior para definir alcance, estimaciones y decisiones de arquitectura. Marca blanca, a tu ritmo.',
    tags: ['Audit', 'Mentoring'],
  },
  {
    id: 'seed-svc-05', idx: '05', order: 5, icon: 'magnifier', featured: true,
    title_en: 'Code review & legacy refactoring',
    title_it: 'Code review e refactoring di codice legacy',
    title_es: 'Revisión de código y refactor de legado',
    desc_en: 'Audits, untangling and incremental rewrites of code that has outgrown itself — without a big-bang rewrite.',
    desc_it: 'Audit, sbrogliare il codice e riscritture incrementali di basi di codice diventate ingestibili — senza riscrivere tutto da capo.',
    desc_es: 'Auditorías, desenredar el código y reescrituras incrementales de bases de código que se han quedado grandes — sin reescribirlo todo de golpe.',
    tags: ['Refactor', 'Legacy'],
  },
];

export const PROJECTS_SEED: ProjectRecord[] = [
  {
    id: 'seed-prj-01', slug: 'atelier-nove', idx: '01',
    client: 'ATELIER NOVE', clientInitials: 'A9', period: '2022 — present',
    featured: true, order: 1,
    title_en: 'Multilingual editorial platform',
    title_it: 'Piattaforma editoriale multilingua',
    title_es: 'Plataforma editorial multilingüe',
    desc_en: "Full case study in progress — the brief, the build decisions and the outcomes will land here once it's written up.",
    desc_it: 'Case study in lavorazione — il brief, le scelte di sviluppo e i risultati arriveranno qui non appena sarà scritto.',
    desc_es: 'Caso de estudio en preparación — el brief, las decisiones de desarrollo y los resultados estarán aquí cuando esté redactado.',
    stack: ['Laravel 11', 'Nuxt 3', 'TypeScript', 'PostgreSQL', 'DigitalOcean', 'Meilisearch'],
    kpis: [
      { label: 'Pagespeed', value: '99 / 100' },
      { label: 'Languages', value: '4' },
      { label: 'Editors', value: '12' },
      { label: 'Uptime · 24m', value: '99.98%' },
    ],
    live_url: '', repo_url: '',
  },
  {
    id: 'seed-prj-02', slug: 'crescendo', idx: '02',
    client: 'CRESCENDO', clientInitials: 'CR', period: '2023 — 2024',
    featured: false, order: 2,
    title_en: 'Subscription billing portal',
    title_it: 'Portale di fatturazione in abbonamento',
    title_es: 'Portal de facturación por suscripción',
    desc_en: "Full case study in progress — the brief, the build decisions and the outcomes will land here once it's written up.",
    desc_it: 'Case study in lavorazione — il brief, le scelte di sviluppo e i risultati arriveranno qui non appena sarà scritto.',
    desc_es: 'Caso de estudio en preparación — el brief, las decisiones de desarrollo y los resultados estarán aquí cuando esté redactado.',
    stack: ['Laravel', 'Vue 3', 'Stripe', 'Redis', 'Hetzner'],
    kpis: [], live_url: '', repo_url: '',
  },
  {
    id: 'seed-prj-03', slug: 'fiore-it', idx: '03',
    client: 'FIORE.IT', clientInitials: 'FI', period: '2021 — 2023',
    featured: false, order: 3,
    title_en: 'E-commerce storefront',
    title_it: 'Vetrina e-commerce',
    title_es: 'Tienda e-commerce',
    desc_en: "Full case study in progress — the brief, the build decisions and the outcomes will land here once it's written up.",
    desc_it: 'Case study in lavorazione — il brief, le scelte di sviluppo e i risultati arriveranno qui non appena sarà scritto.',
    desc_es: 'Caso de estudio en preparación — el brief, las decisiones de desarrollo y los resultados estarán aquí cuando esté redactado.',
    stack: ['Laravel', 'Livewire', 'Tailwind', 'MySQL'],
    kpis: [], live_url: '', repo_url: '',
  },
  {
    id: 'seed-prj-04', slug: 'nordstern', idx: '04',
    client: 'NORDSTERN', clientInitials: 'NS', period: '2020 — 2022',
    featured: true, order: 4,
    title_en: 'Realtime logistics dashboard',
    title_it: 'Dashboard logistica in tempo reale',
    title_es: 'Panel de logística en tiempo real',
    desc_en: "Full case study in progress — the brief, the build decisions and the outcomes will land here once it's written up.",
    desc_it: 'Case study in lavorazione — il brief, le scelte di sviluppo e i risultati arriveranno qui non appena sarà scritto.',
    desc_es: 'Caso de estudio en preparación — el brief, las decisiones de desarrollo y los resultados estarán aquí cuando esté redactado.',
    stack: ['Nuxt', 'Node.js', 'WebSockets', 'Mapbox', 'TimescaleDB'],
    kpis: [], live_url: '', repo_url: '',
  },
  {
    id: 'seed-prj-05', slug: 'oficina-6', idx: '05',
    client: 'OFICINA / 6', clientInitials: 'O6', period: '2019 — 2021',
    featured: false, order: 5,
    title_en: 'Internal operations tool',
    title_it: 'Strumento operativo interno',
    title_es: 'Herramienta de operaciones interna',
    desc_en: "Full case study in progress — the brief, the build decisions and the outcomes will land here once it's written up.",
    desc_it: 'Case study in lavorazione — il brief, le scelte di sviluppo e i risultati arriveranno qui non appena sarà scritto.',
    desc_es: 'Caso de estudio en preparación — el brief, las decisiones de desarrollo y los resultados estarán aquí cuando esté redactado.',
    stack: ['Laravel', 'Vue', 'Inertia', 'Postgres'],
    kpis: [], live_url: '', repo_url: '',
  },
];

// ── Skills (§04) ───────────────────────────────────────────────────────

export type SkillGroup = 'languages' | 'infra' | 'tooling' | 'apis';
export type SkillWeight = 'primary' | 'daily' | 'default';

export interface SkillRecord {
  id: string;
  group: SkillGroup;
  name: string;
  weight: SkillWeight;
  order: number;
}

/** Display order + i18n label key for each skill family (the labels live in the
 *  `translations` collection / i18n JSON under `skills.groups.*`). */
export const SKILL_GROUPS: { key: SkillGroup; idx: string; labelKey: string }[] = [
  { key: 'languages', idx: '01', labelKey: 'skills.groups.languages' },
  { key: 'infra', idx: '02', labelKey: 'skills.groups.infra' },
  { key: 'tooling', idx: '03', labelKey: 'skills.groups.tooling' },
  { key: 'apis', idx: '04', labelKey: 'skills.groups.apis' },
];

export const SKILLS_SEED: SkillRecord[] = [
  { id: 'seed-sk-01', group: 'languages', name: 'PHP', weight: 'daily', order: 1 },
  { id: 'seed-sk-02', group: 'languages', name: 'Laravel', weight: 'primary', order: 2 },
  { id: 'seed-sk-03', group: 'languages', name: 'TypeScript', weight: 'daily', order: 3 },
  { id: 'seed-sk-04', group: 'languages', name: 'Vue', weight: 'primary', order: 4 },
  { id: 'seed-sk-05', group: 'languages', name: 'Nuxt', weight: 'primary', order: 5 },
  { id: 'seed-sk-06', group: 'languages', name: 'Python', weight: 'default', order: 6 },
  { id: 'seed-sk-07', group: 'infra', name: 'Linux', weight: 'daily', order: 1 },
  { id: 'seed-sk-08', group: 'infra', name: 'Nginx', weight: 'daily', order: 2 },
  { id: 'seed-sk-09', group: 'infra', name: 'Docker', weight: 'default', order: 3 },
  { id: 'seed-sk-10', group: 'infra', name: 'DigitalOcean', weight: 'primary', order: 4 },
  { id: 'seed-sk-11', group: 'infra', name: 'VPS · Hetzner', weight: 'default', order: 5 },
  { id: 'seed-sk-12', group: 'tooling', name: 'Git', weight: 'daily', order: 1 },
  { id: 'seed-sk-13', group: 'tooling', name: 'GitHub Actions', weight: 'daily', order: 2 },
  { id: 'seed-sk-14', group: 'tooling', name: 'CI / CD', weight: 'default', order: 3 },
  { id: 'seed-sk-15', group: 'tooling', name: 'Claude Code', weight: 'primary', order: 4 },
  { id: 'seed-sk-16', group: 'apis', name: 'Stripe', weight: 'primary', order: 1 },
  { id: 'seed-sk-18', group: 'apis', name: 'ImageKit', weight: 'default', order: 2 },
  { id: 'seed-sk-19', group: 'apis', name: 'Supabase', weight: 'default', order: 3 },
  { id: 'seed-sk-20', group: 'apis', name: 'PocketBase', weight: 'default', order: 4 },
];

// ── News (carried over from the previous portfolio) ────────────────────

export interface NewsRecord {
  id: string;
  slug: string;
  date: string;
  published: boolean;
  order: number;
  cover: string;
  /** PocketBase serves files relative to its base URL; resolve with the SDK. */
  collectionId?: string;
  tags: string[];
  title_en: string;
  title_it: string;
  title_es: string;
  excerpt_en: string;
  excerpt_it: string;
  excerpt_es: string;
  body_en: string;
  body_it: string;
  body_es: string;
}

/** Localized news item exposed to components — locale-specific fields flattened. */
export interface NewsItem {
  id: string;
  slug: string;
  date: string;
  coverUrl: string;
  tags: string[];
  title: string;
  excerpt: string;
  body: string;
}

/** Empty by default — the historical posts live in PocketBase (`news`). */
export const NEWS_SEED: NewsRecord[] = [];

// ── Customers (carried over from the previous portfolio) ───────────────

export interface CustomerRecord {
  id: string;
  slug: string;
  name: string;
  sector: string;
  url: string;
  logo: string;
  collectionId?: string;
  featured: boolean;
  order: number;
  description_en: string;
  description_it: string;
  description_es: string;
  testimonial_en: string;
  testimonial_it: string;
  testimonial_es: string;
  testimonial_author: string;
}

/** Localized customer exposed to components — locale-specific fields flattened. */
export interface CustomerItem {
  id: string;
  slug: string;
  name: string;
  sector: string;
  url: string;
  logoUrl: string;
  featured: boolean;
  description: string;
  testimonial: string;
  testimonialAuthor: string;
}

/** Empty by default — the historical clients live in PocketBase (`customers`). */
export const CUSTOMERS_SEED: CustomerRecord[] = [];

// ── Pages (arbitrary trilingual content pages: /privacy, /imprint, …) ──

export interface PageRecord {
  id: string;
  slug: string;
  order: number;
  published: boolean;
  title_en: string;
  title_it: string;
  title_es: string;
  body_en: string;
  body_it: string;
  body_es: string;
}

/** Localized content page exposed to components — title/body flattened. */
export interface PageItem {
  id: string;
  slug: string;
  title: string;
  body: string;
}

/** Fallback for the `pages` collection — mirrors the rows seeded by the
 *  `1778600700_created_pages.js` migration. Placeholder copy until the real
 *  legal text is added in the admin. */
export const PAGES_SEED: PageRecord[] = [
  {
    id: 'seed-page-privacy', slug: 'privacy', order: 1, published: true,
    title_en: 'Privacy Policy',
    title_it: 'Informativa sulla privacy',
    title_es: 'Política de privacidad',
    body_en: '<p>This site is a personal portfolio, built to collect as little data as possible.</p><h2>What is stored in your browser</h2><p>One functional item only: <code>miciodev-theme</code> in <code>localStorage</code> — your light/dark theme preference. It is set by this site, kept until you clear your browser storage, and never shared with anyone.</p><h2>The contact form</h2><p>If you use the contact form, the name, email address, subject and message you type are sent to this site\'s own PocketBase backend so your message can reach me. Nothing else is sent, and the data is not used for any other purpose.</p><h2>What this site does not do</h2><ul><li>No analytics, no tracking, no advertising.</li><li>No third-party cookies, pixels or embeds.</li><li>No profiling; no data sold or shared with third parties.</li></ul><h2>Contact</h2><p>Questions about your data? Use the contact form on this site.</p><p><em>This page is informational and is not legal advice.</em></p>',
    body_it: '<p>Questo sito è un portfolio personale, pensato per raccogliere meno dati possibile.</p><h2>Cosa viene salvato nel tuo browser</h2><p>Un solo elemento funzionale: <code>miciodev-theme</code> in <code>localStorage</code> — la tua preferenza di tema chiaro/scuro. È impostato da questo sito, conservato finché non svuoti l\'archivio del browser e mai condiviso con nessuno.</p><h2>Il modulo di contatto</h2><p>Se usi il modulo di contatto, nome, indirizzo email, oggetto e messaggio che scrivi vengono inviati al backend PocketBase di questo sito affinché il messaggio arrivi a me. Non viene inviato altro e i dati non vengono usati per altri scopi.</p><h2>Cosa questo sito non fa</h2><ul><li>Niente analitica, niente tracciamento, niente pubblicità.</li><li>Nessun cookie, pixel o embed di terze parti.</li><li>Nessuna profilazione; nessun dato venduto o condiviso con terzi.</li></ul><h2>Contatti</h2><p>Domande sui tuoi dati? Usa il modulo di contatto di questo sito.</p><p><em>Questa pagina è informativa e non costituisce consulenza legale.</em></p>',
    body_es: '<p>Este sitio es un portfolio personal, hecho para recoger la menor cantidad de datos posible.</p><h2>Qué se guarda en tu navegador</h2><p>Un único elemento funcional: <code>miciodev-theme</code> en <code>localStorage</code> — tu preferencia de tema claro/oscuro. Lo establece este sitio, se conserva hasta que borres el almacenamiento del navegador y nunca se comparte con nadie.</p><h2>El formulario de contacto</h2><p>Si usas el formulario de contacto, el nombre, la dirección de correo, el asunto y el mensaje que escribes se envían al backend PocketBase de este sitio para que tu mensaje llegue hasta mí. No se envía nada más y los datos no se usan para ningún otro fin.</p><h2>Qué no hace este sitio</h2><ul><li>Sin analítica, sin rastreo, sin publicidad.</li><li>Sin cookies, píxeles o incrustaciones de terceros.</li><li>Sin perfilado; ningún dato vendido o compartido con terceros.</li></ul><h2>Contacto</h2><p>¿Preguntas sobre tus datos? Usa el formulario de contacto de este sitio.</p><p><em>Esta página es informativa y no constituye asesoramiento legal.</em></p>',
  },
  {
    id: 'seed-page-imprint', slug: 'imprint', order: 2, published: true,
    title_en: 'Imprint',
    title_it: 'Note legali',
    title_es: 'Aviso legal',
    body_en: '<p><strong>Placeholder.</strong> This is placeholder copy — replace it with the real imprint / legal notice from the admin (collection <code>pages</code>, slug <code>imprint</code>).</p>',
    body_it: '<p><strong>Segnaposto.</strong> Questo è testo segnaposto — sostituiscilo con le note legali reali dall\'admin (collezione <code>pages</code>, slug <code>imprint</code>).</p>',
    body_es: '<p><strong>Marcador de posición.</strong> Este es un texto provisional — reemplázalo con el aviso legal real desde el panel (colección <code>pages</code>, slug <code>imprint</code>).</p>',
  },
];
