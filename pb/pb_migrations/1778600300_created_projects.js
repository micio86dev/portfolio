/// <reference path="../pb_data/types.d.ts" />

// `projects` — the case-study cards in §03 of the home page. One row per
// project, with `title_*` / `desc_*` columns for en / it / es. `featured`
// promotes a card to the big slot; `order` drives the rest. `stack` is a JSON
// array of strings; `kpis` is a JSON array of `{ label, value }`. The Astro
// frontend reads this via getProjects(locale) on each request (featured-first,
// then by `order`) and falls back to PROJECTS_SEED if PocketBase is
// unreachable.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'projects',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          type: 'text',
          name: 'id',
          system: true,
          primaryKey: true,
          required: true,
          min: 15,
          max: 15,
          pattern: '^[a-z0-9]+$',
          autogeneratePattern: '[a-z0-9]{15}',
        },
        { type: 'text', name: 'slug', required: true, max: 100, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        { type: 'text', name: 'idx', required: true, max: 10 },
        { type: 'text', name: 'client', required: true, max: 100 },
        { type: 'text', name: 'clientInitials', max: 8 },
        { type: 'text', name: 'period', max: 50 },
        { type: 'bool', name: 'featured' },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'text', name: 'title_en', required: true, max: 200 },
        { type: 'text', name: 'title_it', max: 200 },
        { type: 'text', name: 'title_es', max: 200 },
        { type: 'text', name: 'desc_en', required: true, max: 4000 },
        { type: 'text', name: 'desc_it', max: 4000 },
        { type: 'text', name: 'desc_es', max: 4000 },
        { type: 'json', name: 'stack', maxSize: 2000 },
        { type: 'json', name: 'kpis', maxSize: 4000 },
        { type: 'url', name: 'live_url', required: false },
        { type: 'url', name: 'repo_url', required: false },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_projects_slug` ON `projects` (`slug`)',
        'CREATE UNIQUE INDEX `idx_projects_idx` ON `projects` (`idx`)',
      ],
    });

    app.save(collection);

    const rows = [
      {
        slug: 'atelier-nove', idx: '01',
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
        slug: 'crescendo', idx: '02',
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
        slug: 'fiore-it', idx: '03',
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
        slug: 'nordstern', idx: '04',
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
        slug: 'oficina-6', idx: '05',
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

    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('projects');
    return app.delete(collection);
  },
);
