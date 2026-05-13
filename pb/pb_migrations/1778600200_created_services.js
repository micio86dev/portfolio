/// <reference path="../pb_data/types.d.ts" />

// `services` — the five service cards in §02 of the home page. One row per
// service, with `title_*` / `desc_*` columns for en / it / es so the copy is
// editable per language from the admin (/_/). `icon` maps to the inline
// line-icon set in astro/src/components/astro/Services.astro; `order` drives
// the on-page order; `featured` flags the cards that get the accent treatment.
// The Astro frontend reads this via getServices(locale) on each request and
// falls back to SERVICES_SEED if PocketBase is unreachable.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'services',
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
        { type: 'text', name: 'idx', required: true, max: 10 },
        { type: 'number', name: 'order', required: false, onlyInt: true },
        {
          type: 'select',
          name: 'icon',
          required: true,
          maxSelect: 1,
          values: ['stack', 'api', 'vps', 'compass', 'magnifier'],
        },
        { type: 'bool', name: 'featured' },
        { type: 'text', name: 'title_en', required: true, max: 200 },
        { type: 'text', name: 'title_it', max: 200 },
        { type: 'text', name: 'title_es', max: 200 },
        { type: 'text', name: 'desc_en', required: true, max: 2000 },
        { type: 'text', name: 'desc_it', max: 2000 },
        { type: 'text', name: 'desc_es', max: 2000 },
        { type: 'json', name: 'tags', maxSize: 2000 },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_services_idx` ON `services` (`idx`)'],
    });

    app.save(collection);

    const rows = [
      {
        idx: '01', order: 1, icon: 'stack', featured: false,
        title_en: 'Full-stack web development',
        title_it: 'Sviluppo web full-stack',
        title_es: 'Desarrollo web full-stack',
        desc_en: 'Laravel back end, Vue or Nuxt front end — one developer across the whole stack. From the first commit to a deploy you can trust.',
        desc_it: 'Back end Laravel, front end Vue o Nuxt — un solo sviluppatore su tutto lo stack. Dal primo commit a un deploy di cui ti puoi fidare.',
        desc_es: 'Back end en Laravel, front end en Vue o Nuxt — un solo desarrollador en todo el stack. Del primer commit a un despliegue en el que puedes confiar.',
        tags: ['Laravel', 'Vue', 'Nuxt'],
      },
      {
        idx: '02', order: 2, icon: 'api', featured: false,
        title_en: 'API design & backend architecture',
        title_it: 'Progettazione API e architettura backend',
        title_es: 'Diseño de APIs y arquitectura backend',
        desc_en: 'REST and GraphQL APIs built to be consumed: versioned, documented, tested. Data models that hold up when the product grows.',
        desc_it: 'API REST e GraphQL pensate per essere consumate: versionate, documentate, testate. Modelli dati che reggono quando il prodotto cresce.',
        desc_es: 'APIs REST y GraphQL pensadas para consumirse: versionadas, documentadas, con tests. Modelos de datos que aguantan cuando el producto crece.',
        tags: ['REST', 'GraphQL'],
      },
      {
        idx: '03', order: 3, icon: 'vps', featured: false,
        title_en: 'VPS infrastructure & DevOps',
        title_it: 'Infrastruttura VPS e DevOps',
        title_es: 'Infraestructura VPS y DevOps',
        desc_en: 'Provisioning, deploys, monitoring and backups on your own servers. CI/CD that ships on green — not on hope.',
        desc_it: 'Provisioning, deploy, monitoraggio e backup sui tuoi server. CI/CD che rilascia quando è tutto verde — non per scommessa.',
        desc_es: 'Aprovisionamiento, despliegues, monitorización y backups en tus propios servidores. CI/CD que publica en verde — no a base de suerte.',
        tags: ['Linux', 'CI/CD'],
      },
      {
        idx: '04', order: 4, icon: 'compass', featured: true,
        title_en: 'Technical consulting for agencies',
        title_it: 'Consulenza tecnica per agenzie',
        title_es: 'Consultoría técnica para agencias',
        desc_en: 'A senior pair of hands for scoping, estimates and architecture calls. White-label, on your timeline.',
        desc_it: 'Una mano senior per scoping, stime e scelte di architettura. White-label, sui tuoi tempi.',
        desc_es: 'Un par de manos sénior para definir alcance, estimaciones y decisiones de arquitectura. Marca blanca, a tu ritmo.',
        tags: ['Audit', 'Mentoring'],
      },
      {
        idx: '05', order: 5, icon: 'magnifier', featured: true,
        title_en: 'Code review & legacy refactoring',
        title_it: 'Code review e refactoring di codice legacy',
        title_es: 'Revisión de código y refactor de legado',
        desc_en: 'Audits, untangling and incremental rewrites of code that has outgrown itself — without a big-bang rewrite.',
        desc_it: 'Audit, sbrogliare il codice e riscritture incrementali di basi di codice diventate ingestibili — senza riscrivere tutto da capo.',
        desc_es: 'Auditorías, desenredar el código y reescrituras incrementales de bases de código que se han quedado grandes — sin reescribirlo todo de golpe.',
        tags: ['Refactor', 'Legacy'],
      },
    ];

    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('services');
    return app.delete(collection);
  },
);
