/// <reference path="../pb_data/types.d.ts" />

// `courses` — the online courses listed in the "Courses" section of the home
// page. One row per course, with `title_*` / `desc_*` columns for en / it / es
// so the copy is editable per language from the admin (/_/). `platform` flags
// where the course lives (Udemy or a YouTube playlist); `url` is the outbound
// link; `image` an optional cover; `featured` promotes a card; `order` drives
// the on-page order. The Astro frontend reads this via getCourses(locale) on
// each request and falls back to COURSES_SEED if PocketBase is unreachable.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'courses',
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
        { type: 'text', name: 'title_en', required: true, max: 200 },
        { type: 'text', name: 'title_it', max: 200 },
        { type: 'text', name: 'title_es', max: 200 },
        { type: 'text', name: 'desc_en', max: 600 },
        { type: 'text', name: 'desc_it', max: 600 },
        { type: 'text', name: 'desc_es', max: 600 },
        {
          type: 'select',
          name: 'platform',
          required: true,
          maxSelect: 1,
          values: ['udemy', 'youtube'],
        },
        { type: 'url', name: 'url', required: true },
        {
          type: 'file',
          name: 'image',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
        },
        { type: 'bool', name: 'featured' },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_courses_slug` ON `courses` (`slug`)',
        'CREATE INDEX `idx_courses_order` ON `courses` (`order`)',
      ],
    });

    app.save(collection);

    const rows = [
      {
        slug: 'devops', order: 1, platform: 'udemy', featured: true,
        title_en: 'DevOps', title_it: '', title_es: '',
        desc_en: 'Hands-on DevOps fundamentals — CI/CD, containers, automation.',
        desc_it: '', desc_es: '',
        url: 'https://www.udemy.com/course/devops-base/?referralCode=9E9B8A6F662F2D7045B7&couponCode=E623B44A3C89CEF9F9B6',
      },
      {
        slug: 'php-base', order: 2, platform: 'youtube', featured: false,
        title_en: 'PHP Base', title_it: '', title_es: '',
        desc_en: 'PHP from scratch — a full beginner playlist.',
        desc_it: '', desc_es: '',
        url: 'https://www.youtube.com/watch?v=UttHm-Mwqfc&list=PLpT9bDwYZoZtT6aV8aB2ZR7K4RkqSULeu&index=2',
      },
      {
        slug: 'sql-base', order: 3, platform: 'youtube', featured: false,
        title_en: 'SQL Base', title_it: '', title_es: '',
        desc_en: 'SQL fundamentals — queries, joins, schema design.',
        desc_it: '', desc_es: '',
        url: 'https://www.youtube.com/watch?v=gv0Bz48YLD4&list=PLpT9bDwYZoZstOfTkzHLVa3RDYE2PRqWz',
      },
    ];

    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('courses');
    return app.delete(collection);
  },
);
