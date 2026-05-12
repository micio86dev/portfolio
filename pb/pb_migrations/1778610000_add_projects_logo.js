/// <reference path="../pb_data/types.d.ts" />

// `projects.logo` — an optional brand mark for the case study itself (single
// file), mirroring `customers.logo`. This lets projects without a linked
// `customer` (personal projects, or client work whose customer carries no
// logo) still show an avatar. The frontend's crest resolution order is:
//   project.logo → linked customer.logo → project.clientInitials → initials
//                                           off the customer / client name.
// See enrichProject() in astro/src/lib/pocketbase.ts and the `logo` /
// `crestUrl` / `crestInitials` fields in astro/src/lib/seed-data.ts.
//
// `fields.add()` replaces a same-named field, so this is safe whatever state
// the collection is in. Idempotent.

migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects');
    projects.fields.add(
      new Field({
        type: 'file',
        name: 'logo',
        maxSelect: 1,
        maxSize: 2097152,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
      }),
    );
    return app.save(projects);
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects');
    projects.fields.removeByName('logo');
    return app.save(projects);
  },
);
