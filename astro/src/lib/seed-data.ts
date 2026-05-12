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
 * files. Projects and Customers carry the real content (kept in sync with the
 * `1778602000_seed_projects_customers.js` migration); News falls back to an
 * empty array (its historical content is loaded by a future migration).
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
  /** Display name of the client (= the linked customer's name, or "Personal project"). */
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
  /** Relation → `customers.id`; empty for personal projects. */
  customer?: string;
  /** Gallery filenames stored in PocketBase; resolve with the SDK against `collectionId`. */
  images: string[];
  /** Filename within `images` to treat as the primary one (empty ⇒ first/none). */
  primary_image: string;
  collectionId?: string;
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
    id: 'seed-prj-01', slug: 'fiberdroid-customer-area', idx: '01',
    client: 'Fiberdroid', clientInitials: 'FD', period: '2021 — present',
    featured: true, order: 1, customer: 'seed-cus-fiberdroid',
    title_en: 'Customer area & operations portal', title_it: '', title_es: '',
    desc_en:
      "A PWA (single-page app) backed by a REST API. It packs a lot: a notification system over push, WebSocket and email; user roles and permissions; automated invoicing for end customers; appointment management; product shipments; and full contract management and workflow — among much more. Development is a continuous stream of improvements, but it rests on a stable base built since 2021, is well documented, and ships with unit tests covering the system's core functions.",
    desc_it: '', desc_es: '',
    stack: ['Laravel 9', 'Nuxt 2', 'REST API', 'PWA / SPA', 'WebSockets', 'Push notifications'],
    kpis: [], live_url: 'https://area-clienti.fiberdroid.it', repo_url: '',
    images: [], primary_image: '',
  },
  {
    id: 'seed-prj-02', slug: 'inspxt', idx: '02',
    client: 'TC2 Group', clientInitials: 'T2', period: '2022 — present',
    featured: false, order: 2, customer: 'seed-cus-tc2-group',
    title_en: 'INspxt — inspections management platform', title_it: '', title_es: '',
    desc_en:
      'An app for managing inspectors and the inspections they carry out. The Laravel REST API handles user roles and permissions — chiefly administrators and inspectors — while the React front end fully separates the two roles, showing a simplified interface to inspectors, who can reach only a subset of features. The system is stable and performant given the access and data traffic it handles, and it mainly drives inspection activities that certify the quality of customer products. A complete refactoring improved the UX, simplified the database structure, migrated the data to the new schema, and streamlined the server-side code both syntactically and logically.',
    desc_it: '', desc_es: '',
    stack: ['Laravel 9', 'React', 'REST API', 'Redis'],
    kpis: [], live_url: 'https://inspxt.tc2services.app', repo_url: '',
    images: [], primary_image: '',
  },
  {
    id: 'seed-prj-03', slug: 'standup-way-platform', idx: '03',
    client: 'Nuovavita', clientInitials: 'NV', period: '2023 — present',
    featured: true, order: 3, customer: 'seed-cus-nuovavita',
    title_en: 'StandUp Way platform', title_it: '', title_es: '',
    desc_en:
      "A PWA (SPA) connected to a REST API. Features include a notification system over push, WebSocket and email; user roles and permissions; automated scheduling for the group's video calls (via agora.io); appointment management; dynamic clinical record cards for customers; and much more. Development keeps evolving, but it rests on a stable base built since 2023, is well documented, and ships with Playwright tests covering the system's core flows from the front end.",
    desc_it: '', desc_es: '',
    stack: ['Laravel 12', 'Nuxt 4', 'MySQL', 'Redis', 'agora.io', 'SSR / PWA', 'Playwright'],
    kpis: [], live_url: 'https://admin.metodostandup.it', repo_url: '',
    images: [], primary_image: '',
  },
  {
    id: 'seed-prj-04', slug: 'silent-hill-web', idx: '04',
    client: 'Personal project', clientInitials: 'SH', period: '2023 — present',
    featured: false, order: 4,
    title_en: 'Silent Hill Web', title_it: '', title_es: '',
    desc_en:
      'After the announcements of new entries in the saga I built a PWA in Nuxt 3 + Laravel 10 for my favourite game series. It is server-side rendered and tuned across accessibility and usability for SEO. It has an event notification system, interactive maps built on the in-game map images, and a two-axis navigation — a horizontal menu to pick the game, a vertical one for its sub-sections and the generic sections. Users sign up by email or via Facebook Login. The admin panel — built in Nuxt 2 to move faster, then fully refactored to Nuxt 4 + shadcn — manages multiple user roles with configurable permissions and uploads images and YouTube videos quickly. Both the site and the panel are trilingual: Italian, English and Spanish. It is a fully non-profit project, so the main thing missing is content — collaborators who know Silent Hill well are welcome.',
    desc_it: '', desc_es: '',
    stack: ['Laravel 12', 'Nuxt 4', 'Reverb · WebSockets', 'Redis', 'SSR / PWA', 'shadcn', 'i18n · it/en/es'],
    kpis: [
      { label: 'Languages', value: '3' },
      { label: 'Rendering', value: 'SSR' },
    ],
    live_url: 'https://silenthillweb.com', repo_url: '',
    images: [], primary_image: '',
  },
  {
    id: 'seed-prj-05', slug: 'devboards-io', idx: '05',
    client: 'Personal project', clientInitials: 'DB', period: '2024 — present',
    featured: true, order: 5,
    title_en: 'DevBoards.io', title_it: '', title_es: '',
    desc_en:
      'An IT job-discovery and tech-news platform aimed at the European and U.S. markets. It aggregates job listings from 10+ sources using AI-powered APIs, serves multilingual tech news, and includes a custom CMS admin dashboard for content management. Two Python scripts import jobs every 12 hours via RSS feeds and public job-portal APIs, filtering Tech/IT roles and auto-categorising each listing with relevant metadata — so users discover thousands of opportunities a day from a single platform in five languages, with fast filters for skills, availability and seniority. Each user gets a compatibility score for every posting, and companies get a trust score based on the quality of their ads plus a community-driven like/dislike rating. GitHub repo (6 submodules + CI/CD): https://github.com/micio86dev/itjobhub-antigravity-config',
    desc_it: '', desc_es: '',
    stack: ['ElysiaJS', 'Bun', 'Qwik', 'Python 3.11', 'MongoDB', 'Redis'],
    kpis: [
      { label: 'Job sources', value: '10+' },
      { label: 'Languages', value: '5' },
      { label: 'Import cycle', value: '12h' },
    ],
    live_url: 'https://devboards.io',
    repo_url: 'https://github.com/micio86dev/itjobhub-antigravity-config',
    images: [], primary_image: '',
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

// ── Career path (the "About" section · §) ──────────────────────────────

/** Mirrors the `career` collection (1778606000_created_career.js): one row per
 *  milestone, with `body_*` columns per locale and an optional `tech` tag list.
 *  The section intro line is *not* here — it's a UI string (`career.intro`). */
export interface CareerRecord {
  id: string;
  /** Short label, e.g. "2010" or "2018 — present". */
  period: string;
  /** Employer / context, e.g. "Proxime S.r.l." or "Freelance · Canary Islands". */
  company: string;
  body_en: string;
  body_it: string;
  body_es: string;
  /** Optional tech-tag chips for the milestone. */
  tech: string[];
  /** Display order — oldest first; the component decides the visual direction. */
  order: number;
}

/** Localized career milestone exposed to components — `body` flattened. */
export interface CareerItem {
  id: string;
  period: string;
  company: string;
  body: string;
  tech: string[];
}

/** Fallback for the `career` collection — mirrors the rows seeded by
 *  `1778606000_created_career.js` (English bodies only; it/es fall back). */
export const CAREER_SEED: CareerRecord[] = [
  {
    id: 'seed-career-01', period: '2010', company: 'Proxime S.r.l.',
    body_en:
      'Monitored photovoltaic systems and built websites for public administration. In charge of the PA sites and their back-end in pure PHP / XHTML; also wrote Perl scripts so the photovoltaic-system inverters could talk to the monitoring system.',
    body_it: '', body_es: '',
    tech: ['PHP', 'XHTML', 'Perl'], order: 1,
  },
  {
    id: 'seed-career-02', period: '2013', company: 'Alcos Digital S.r.l.',
    body_en:
      'Learned to work with PHP frameworks (including Laravel); also developed native iOS apps in Objective-C.',
    body_it: '', body_es: '',
    tech: ['PHP', 'Laravel', 'Objective-C', 'iOS'], order: 2,
  },
  {
    id: 'seed-career-03', period: '2015', company: 'SiComunicaWeb S.r.l.',
    body_en:
      'Worked on PrestaShop e-commerce; built mobile apps with Ionic (AngularJS); shipped first Laravel REST APIs; fell in love with real-time tech like WebSockets.',
    body_it: '', body_es: '',
    tech: ['PrestaShop', 'Ionic', 'AngularJS', 'Laravel', 'WebSockets'], order: 3,
  },
  {
    id: 'seed-career-04', period: '2018 — present', company: 'Freelance · Canary Islands',
    body_en:
      'Varied clients; moved to NuxtJS (Vue) as a current favourite front-end tech; still developing in Laravel; in spare time always experimenting with whatever improves web-app performance.',
    body_it: '', body_es: '',
    tech: ['Nuxt', 'Vue', 'Laravel'], order: 4,
  },
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
  /** Optional brand mark (single file). */
  logo: string;
  /** Gallery filenames; resolve with the SDK against `collectionId`. */
  images: string[];
  /** Filename within `images` to treat as the primary one (empty ⇒ first/none). */
  primary_image: string;
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

/** Mirrors the rows seeded by `1778602000_seed_projects_customers.js`. */
export const CUSTOMERS_SEED: CustomerRecord[] = [
  {
    id: 'seed-cus-fiberdroid', slug: 'fiberdroid', name: 'Fiberdroid',
    sector: 'Telecommunications', url: 'https://fiberdroid.it',
    logo: '', images: [], primary_image: '', featured: true, order: 1,
    description_en:
      'A telecommunications company that connects businesses and professionals to the internet over VoIP, WiFi, cloud and optical fibre. It builds cloud and IT solutions tailored to each client, helping companies integrate every communication service — the Internet included — to make their business fly.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
  {
    id: 'seed-cus-tc2-group', slug: 'tc2-group', name: 'TC2 Group',
    sector: 'Quality control & inspection', url: 'https://www.tc2group.it',
    logo: '', images: [], primary_image: '', featured: true, order: 2,
    description_en:
      'A long-standing client, and currently the largest of my career. TC2 works in quality control and manages the agents who carry it out; the web-development group I belong to handles a small slice of what the company does. The collaboration began in 2022 — first a demo of a management system, then a full rewrite of the API behind their main management system, given the low quality of the previously written code.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
  {
    id: 'seed-cus-nuovavita', slug: 'nuovavita', name: 'Nuovavita',
    sector: 'Health · addiction recovery', url: 'https://metodostandup.it',
    logo: '', images: [], primary_image: '', featured: true, order: 3,
    description_en:
      'The Standup Method is the first remote addiction-recovery programme. In its first year alone it changed the lives of over 100 people across Europe, with the mission of helping thousands quit cocaine addiction. It is a six-month programme followed from home, created by Danilo Cuccagna — a certified coach who definitively overcame his own addiction — together with internationally qualified psychologists, psychotherapists, psychiatrists and professional educators who went through addiction and came out of it thanks to the method.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
  {
    id: 'seed-cus-proxime', slug: 'proxime', name: 'Proxime',
    sector: 'Photovoltaic monitoring · PA portals', url: 'http://www.sunguard.it',
    logo: '', images: [], primary_image: '', featured: false, order: 4,
    description_en:
      'Proxime conceives, designs and builds solutions grounded in advanced communication theory and innovative open-source technology. Its staff combines heterogeneous skills across communication, IT, marketing, design and human–machine interaction, applies usability and accessibility throughout, and ships products with initial training and real coaching so users are productive immediately. Work spans SUAP / OpenTRIUM territorial-marketing portals, accessible web portals for public administration, corporate e-learning and training, hardware and software sales, and photovoltaic-systems monitoring.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
  {
    id: 'seed-cus-alcos-digital', slug: 'alcos-digital', name: 'Alcos Digital',
    sector: 'Communication & marketing', url: 'https://alcoscomunicazione.com',
    logo: '', images: [], primary_image: '', featured: false, order: 5,
    description_en:
      'The agency where I actually learned to work with PHP and a range of frameworks — including my favourite, Laravel. For two years I was also involved in native iOS development in Objective-C. The company eventually went into layoffs and I moved on; there is little information about it on the web today.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
  {
    id: 'seed-cus-kotuko', slug: 'kotuko', name: 'Kotuko',
    sector: 'Digital marketing · web design', url: 'https://www.kotuko.it/',
    logo: '', images: [], primary_image: '', featured: false, order: 6,
    description_en:
      'Kotuko supports companies through their digital-evolution process, offering solutions across digital marketing, web design and IT technology. A dynamic team powered by change — convinced that the greatest danger is not having the courage to transform.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
  {
    id: 'seed-cus-formafarm', slug: 'formafarm', name: 'FormaFarm',
    sector: 'E-learning · knowledge management', url: 'https://lp.formafarm.com',
    logo: '', images: [], primary_image: '', featured: false, order: 7,
    description_en:
      'My first client when I went freelance. Forma Farm provides highly specialised IT and software-development services for e-learning and knowledge-management projects based on Forma LMS. It merges 16 years of e-learning consulting from E-learnit with the cloud-computing and web-solutions expertise of Purple Network — both partners and founders of the Forma Association and developers of Forma LMS, the award-winning open-source learning management system. The "Farm" is the natural evolution of years of collaboration: creating space to grow your e-learning business and ideas.',
    description_it: '', description_es: '',
    testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
  },
];

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
 *  `1778600700_created_pages.js` migration and updated by
 *  `1778601000_update_imprint_page.js`. The legal-notice body is generic;
 *  the owner should fill in the real legal entity details in the admin
 *  (collection `pages`, slug `imprint`) — see that migration's notes. */
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
    title_en: 'Legal notice',
    title_it: 'Note legali',
    title_es: 'Aviso legal',
    body_en: '<p>This site, <strong>miciodev.com</strong>, is the personal portfolio of MicioDev — a freelance full-stack developer (Laravel, Vue, Nuxt) working remotely from the Canary Islands, Spain. It exists to present services, selected work and a way to get in touch.</p><h2>Who is responsible</h2><p>The site is operated by MicioDev (freelance full-stack developer). The full legal name, business address, VAT / tax identification number and the competent jurisdiction are available on request — write through the contact form on this site and they will be provided.</p><h2>Hosting &amp; data processing</h2><p>The site runs on a virtual private server and uses a self-hosted PocketBase backend for content and for contact-form submissions. No third-party analytics, advertising or tracking services are used. For details on what is stored and why, see the <a href="/privacy">privacy policy</a>.</p><h2>Intellectual property</h2><p>Unless stated otherwise, the text, code, design and graphics on this site are the property of MicioDev and are protected by copyright. Third-party names, logos and trademarks shown in case studies or as references remain the property of their respective owners. Reuse beyond what copyright law permits requires prior written consent.</p><h2>External links</h2><p>This site may link to external websites that are outside its control. No responsibility is taken for the content, availability or data-protection practices of those sites; visiting them is at your own risk.</p><h2>Limitation of liability</h2><p>The content of this site is provided in good faith and for general information only. While reasonable care is taken to keep it accurate and up to date, no warranty is given as to its completeness or correctness, and no liability is accepted for any loss arising from its use.</p><h2>Contact</h2><p>This page is informational and does not constitute legal advice. Questions, corrections or legal notices can be sent through the <a href="/#contact">contact form</a> on this site.</p>',
    body_it: '<p>Questo sito, <strong>miciodev.com</strong>, è il portfolio personale di MicioDev — sviluppatore full-stack freelance (Laravel, Vue, Nuxt) che lavora da remoto dalle Isole Canarie, Spagna. Serve a presentare i servizi, una selezione di lavori e un modo per mettersi in contatto.</p><h2>Titolare e responsabile</h2><p>Il sito è gestito da MicioDev (sviluppatore full-stack freelance). Ragione/denominazione legale completa, indirizzo dell\'attività, partita IVA / codice fiscale e foro competente sono disponibili su richiesta — scrivi tramite il modulo di contatto del sito e verranno forniti.</p><h2>Hosting e trattamento dei dati</h2><p>Il sito gira su un server privato virtuale e usa un backend PocketBase self-hosted per i contenuti e per gli invii del modulo di contatto. Non vengono usati servizi di analitica, pubblicità o tracciamento di terze parti. Per i dettagli su cosa viene conservato e perché, consulta l\'<a href="/privacy">informativa sulla privacy</a>.</p><h2>Proprietà intellettuale</h2><p>Salvo diversa indicazione, testi, codice, design e grafica di questo sito sono di proprietà di MicioDev e sono protetti dal diritto d\'autore. Nomi, loghi e marchi di terze parti mostrati nei case study o come riferimenti restano di proprietà dei rispettivi titolari. Qualsiasi riutilizzo che vada oltre quanto consentito dalla legge sul diritto d\'autore richiede consenso scritto preventivo.</p><h2>Link esterni</h2><p>Questo sito può rimandare a siti esterni che non sono sotto il suo controllo. Non si assume alcuna responsabilità per contenuti, disponibilità o pratiche di protezione dei dati di tali siti; la visita avviene a tuo rischio.</p><h2>Limitazione di responsabilità</h2><p>I contenuti del sito sono forniti in buona fede e a solo scopo informativo generale. Pur prestando ragionevole cura per mantenerli accurati e aggiornati, non si fornisce alcuna garanzia sulla loro completezza o correttezza e non si accetta alcuna responsabilità per eventuali danni derivanti dal loro uso.</p><h2>Contatti</h2><p>Questa pagina è informativa e non costituisce consulenza legale. Domande, correzioni o comunicazioni legali possono essere inviate tramite il <a href="/#contact">modulo di contatto</a> del sito.</p>',
    body_es: '<p>Este sitio, <strong>miciodev.com</strong>, es el portfolio personal de MicioDev — desarrollador full-stack freelance (Laravel, Vue, Nuxt) que trabaja en remoto desde las Islas Canarias, España. Existe para presentar los servicios, una selección de trabajos y una forma de ponerse en contacto.</p><h2>Quién es el responsable</h2><p>El sitio lo gestiona MicioDev (desarrollador full-stack freelance). El nombre legal completo, el domicilio de la actividad, el NIF / número de identificación fiscal y la jurisdicción competente están disponibles bajo petición — escribe a través del formulario de contacto del sitio y se facilitarán.</p><h2>Alojamiento y tratamiento de datos</h2><p>El sitio se ejecuta en un servidor privado virtual y usa un backend PocketBase autoalojado para el contenido y para los envíos del formulario de contacto. No se usan servicios de analítica, publicidad ni rastreo de terceros. Para más detalles sobre qué se guarda y por qué, consulta la <a href="/privacy">política de privacidad</a>.</p><h2>Propiedad intelectual</h2><p>Salvo que se indique lo contrario, los textos, el código, el diseño y los gráficos de este sitio son propiedad de MicioDev y están protegidos por derechos de autor. Los nombres, logotipos y marcas de terceros mostrados en los casos de estudio o como referencias siguen siendo propiedad de sus respectivos titulares. Cualquier reutilización más allá de lo que permite la ley de propiedad intelectual requiere consentimiento previo por escrito.</p><h2>Enlaces externos</h2><p>Este sitio puede enlazar a sitios externos que están fuera de su control. No se asume responsabilidad alguna por el contenido, la disponibilidad o las prácticas de protección de datos de esos sitios; visitarlos es bajo tu propio riesgo.</p><h2>Limitación de responsabilidad</h2><p>El contenido de este sitio se ofrece de buena fe y solo con fines de información general. Aunque se pone un cuidado razonable en mantenerlo exacto y actualizado, no se ofrece garantía alguna sobre su integridad o corrección, ni se acepta responsabilidad por cualquier pérdida derivada de su uso.</p><h2>Contacto</h2><p>Esta página es informativa y no constituye asesoramiento legal. Las preguntas, correcciones o comunicaciones legales pueden enviarse a través del <a href="/#contact">formulario de contacto</a> del sitio.</p>',
  },
];
