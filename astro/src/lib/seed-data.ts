/**
 * Fallback data for Services & Projects.
 *
 * Shapes mirror the PocketBase collections described in the design handoff
 * (README → "PocketBase collections schema") so swapping to live data is a
 * drop-in. Used by src/lib/pocketbase.ts whenever PUBLIC_PB_URL is unset or
 * the instance is unreachable, so the site still renders.
 *
 * The service copy here mirrors the `services.items.*` strings in the i18n
 * files. Project titles/descriptions are deliberately generic — the real
 * case-study content lives in PocketBase.
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
