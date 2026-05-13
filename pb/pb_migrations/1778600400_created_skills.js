/// <reference path="../pb_data/types.d.ts" />

// `skills` — the tech pills in §04 of the home page. One row per tool. `group`
// is one of the four families (their display labels live in the `translations`
// collection under `skills.groups.*`); `weight` controls the pill style
// (primary = daily & preferred, daily = current rotation, default = when the
// job calls for it); `order` sorts within a group. The Astro frontend reads
// this via getSkills() on each request and falls back to SKILLS_SEED if
// PocketBase is unreachable. Tool names are not translated.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'skills',
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
        {
          type: 'select',
          name: 'group',
          required: true,
          maxSelect: 1,
          values: ['languages', 'infra', 'tooling', 'apis'],
        },
        { type: 'text', name: 'name', required: true, max: 60 },
        {
          type: 'select',
          name: 'weight',
          required: true,
          maxSelect: 1,
          values: ['primary', 'daily', 'default'],
        },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX `idx_skills_group_order` ON `skills` (`group`, `order`)'],
    });

    app.save(collection);

    const rows = [
      { group: 'languages', name: 'PHP', weight: 'daily', order: 1 },
      { group: 'languages', name: 'Laravel', weight: 'primary', order: 2 },
      { group: 'languages', name: 'TypeScript', weight: 'daily', order: 3 },
      { group: 'languages', name: 'Vue', weight: 'primary', order: 4 },
      { group: 'languages', name: 'Nuxt', weight: 'primary', order: 5 },
      { group: 'languages', name: 'Python', weight: 'default', order: 6 },

      { group: 'infra', name: 'Linux', weight: 'daily', order: 1 },
      { group: 'infra', name: 'Nginx', weight: 'daily', order: 2 },
      { group: 'infra', name: 'Docker', weight: 'default', order: 3 },
      { group: 'infra', name: 'DigitalOcean', weight: 'primary', order: 4 },
      { group: 'infra', name: 'VPS · Hetzner', weight: 'default', order: 5 },

      { group: 'tooling', name: 'Git', weight: 'daily', order: 1 },
      { group: 'tooling', name: 'GitHub Actions', weight: 'daily', order: 2 },
      { group: 'tooling', name: 'CI / CD', weight: 'default', order: 3 },
      { group: 'tooling', name: 'Claude Code', weight: 'primary', order: 4 },

      { group: 'apis', name: 'Stripe', weight: 'primary', order: 1 },
      { group: 'apis', name: 'ImageKit', weight: 'default', order: 2 },
      { group: 'apis', name: 'Supabase', weight: 'default', order: 3 },
      { group: 'apis', name: 'PocketBase', weight: 'default', order: 4 },
    ];

    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('skills');
    return app.delete(collection);
  },
);
