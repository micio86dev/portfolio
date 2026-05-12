/// <reference path="../pb_data/types.d.ts" />

// `customers` — clients carried over from the previous portfolio
// (micio86dev.it). One row per client, with `description_*` / `testimonial_*`
// columns for en / it / es. `url` an optional link; `sector` a short label;
// `featured` / `order` drive placement. `started` / `ended` are the
// collaboration span (datetimes — `ended` empty ⇒ the collaboration is
// ongoing). The Astro frontend reads this via getCustomers(locale) and falls
// back to CUSTOMERS_SEED if PocketBase is unreachable.
//
// Image semantics (all editable from the PB backoffice):
//   - `logo`          — the company / brand logo (single file). Shown on the
//                       frontend (Hero "trusted by" strip) via `logoUrl`.
//   - `primary_image` — names the file (within `images`) used as the main
//                       visual; for a customer this is a SCREENSHOT of the
//                       client's portal (uploaded later via admin).
//   - `images`        — an extra gallery (file, multi-select) of additional
//                       screenshots / shots.
//
// SEED: rows are inserted by `1778602000_seed_projects_customers.js` (it owns
// both this collection's content and `projects`', and the projects → customers
// link). The collaboration dates are also re-asserted by
// `1778605000_update_collaboration_dates.js` for already-migrated instances.
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
        { type: 'date', name: 'started' },
        { type: 'date', name: 'ended' },
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
