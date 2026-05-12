/// <reference path="../pb_data/types.d.ts" />

// `projects` — the case-study cards in §03 of the home page. One row per
// project, with `title_*` / `desc_*` columns for en / it / es. `featured`
// promotes a card to the big slot; `order` drives the rest. `stack` is a JSON
// array of strings; `kpis` a JSON array of `{ label, value }`. `client` /
// `clientInitials` are the display crest; `customer` (a relation to the
// `customers` collection — added in 1778602000, since `customers` doesn't
// exist yet at this point in the migration order) links the case study to its
// client. Personal projects have no `customer`. `images` is a small gallery
// (file, multi-select); `primary_image` names which uploaded file is the
// primary one.
//
// Seed rows are inserted by `1778602000_seed_projects_customers.js` (it owns
// both this collection's content and `customers`', and the cross-collection
// link). The Astro frontend reads this via getProjects(locale) on each request
// (featured-first, then by `order`) and falls back to PROJECTS_SEED if
// PocketBase is unreachable.
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
        {
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
        },
        { type: 'text', name: 'primary_image', max: 255 },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_projects_slug` ON `projects` (`slug`)',
        'CREATE UNIQUE INDEX `idx_projects_idx` ON `projects` (`idx`)',
      ],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('projects');
    return app.delete(collection);
  },
);
