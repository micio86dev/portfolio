/// <reference path="../pb_data/types.d.ts" />

// `customers` — clients carried over from the previous portfolio
// (micio86dev.it). One row per client, with `description_*` / `testimonial_*`
// columns for en / it / es. `logo` is an optional brand mark; `images` a small
// gallery (file, multi-select) with `primary_image` naming the primary file;
// `url` an optional link; `sector` a short label; `featured` / `order` drive
// placement. The Astro frontend reads this via getCustomers(locale) and falls
// back to CUSTOMERS_SEED if PocketBase is unreachable.
//
// SEED: rows are inserted by `1778602000_seed_projects_customers.js` (it owns
// both this collection's content and `projects`', and the projects → customers
// link).
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'customers',
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
        { type: 'text', name: 'slug', required: true, max: 120, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        { type: 'text', name: 'name', required: true, max: 120 },
        { type: 'text', name: 'sector', max: 100 },
        { type: 'url', name: 'url', required: false },
        { type: 'file', name: 'logo', maxSelect: 1, maxSize: 2097152, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'] },
        {
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
        },
        { type: 'text', name: 'primary_image', max: 255 },
        { type: 'bool', name: 'featured' },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'text', name: 'description_en', max: 2000 },
        { type: 'text', name: 'description_it', max: 2000 },
        { type: 'text', name: 'description_es', max: 2000 },
        { type: 'text', name: 'testimonial_en', max: 2000 },
        { type: 'text', name: 'testimonial_it', max: 2000 },
        { type: 'text', name: 'testimonial_es', max: 2000 },
        { type: 'text', name: 'testimonial_author', max: 120 },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_customers_slug` ON `customers` (`slug`)'],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('customers');
    return app.delete(collection);
  },
);
