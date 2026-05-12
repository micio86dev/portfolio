/// <reference path="../pb_data/types.d.ts" />

// `career` — the milestones in the "About" / professional-path section of the
// home page. One row per milestone, with `body_*` columns for en / it / es so
// the copy is editable per language from the admin (/_/). `period` is the
// short label ("2010", "2018 — present"); `company` the employer/context;
// `tech` is an optional JSON array of tech-tag strings; `order` drives the
// on-page order (oldest first — the component decides display direction). The
// section's intro line is *not* a milestone: it lives in the `translations`
// collection under `career.intro`. The Astro frontend reads this via
// getCareer(locale) on each request (sorted by `order`) and falls back to
// CAREER_SEED if PocketBase is unreachable.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'career',
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
        { type: 'text', name: 'period', required: true, max: 50 },
        { type: 'text', name: 'company', max: 120 },
        { type: 'text', name: 'body_en', required: true, max: 2000 },
        { type: 'text', name: 'body_it', max: 2000 },
        { type: 'text', name: 'body_es', max: 2000 },
        { type: 'json', name: 'tech', maxSize: 1000 },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX `idx_career_order` ON `career` (`order`)'],
    });

    app.save(collection);

    const rows = [
      {
        period: '2010',
        company: 'Proxime S.r.l.',
        body_en:
          'Monitored photovoltaic systems and built websites for public administration. In charge of the PA sites and their back-end in pure PHP / XHTML; also wrote Perl scripts so the photovoltaic-system inverters could talk to the monitoring system.',
        tech: ['PHP', 'XHTML', 'Perl'],
        order: 1,
      },
      {
        period: '2013',
        company: 'Alcos Digital S.r.l.',
        body_en:
          'Learned to work with PHP frameworks (including Laravel); also developed native iOS apps in Objective-C.',
        tech: ['PHP', 'Laravel', 'Objective-C', 'iOS'],
        order: 2,
      },
      {
        period: '2015',
        company: 'SiComunicaWeb S.r.l.',
        body_en:
          'Worked on PrestaShop e-commerce; built mobile apps with Ionic (AngularJS); shipped first Laravel REST APIs; fell in love with real-time tech like WebSockets.',
        tech: ['PrestaShop', 'Ionic', 'AngularJS', 'Laravel', 'WebSockets'],
        order: 3,
      },
      {
        period: '2018 — present',
        company: 'Freelance · Canary Islands',
        body_en:
          'Varied clients; moved to NuxtJS (Vue) as a current favourite front-end tech; still developing in Laravel; in spare time always experimenting with whatever improves web-app performance.',
        tech: ['Nuxt', 'Vue', 'Laravel'],
        order: 4,
      },
    ];

    for (const row of rows) {
      const rec = new Record(collection);
      rec.set('period', row.period);
      rec.set('company', row.company);
      rec.set('body_en', row.body_en);
      rec.set('body_it', '');
      rec.set('body_es', '');
      rec.set('tech', row.tech);
      rec.set('order', row.order);
      app.save(rec);
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('career');
    return app.delete(collection);
  },
);
