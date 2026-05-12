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
