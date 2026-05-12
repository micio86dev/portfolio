/// <reference path="../pb_data/types.d.ts" />

// Forward "update" step for instances already migrated past
// `1778602000_seed_projects_customers.js` (whose `created_*` + seed migrations
// were applied before the `started`/`ended` date fields existed). Editing the
// earlier migrations only helps fresh deploys; this one brings existing DBs in
// line.
//
// `up(app)`:
//   1. idempotently adds the `started` + `ended` `date` fields to both the
//      `customers` and `projects` collections — `collection.fields.add()`
//      REPLACES a same-named field, so this is a no-op on a fresh DB where the
//      `created_*` migrations already declared them;
//   2. updates every existing customer / project record (matched by `slug`)
//      with its collaboration span, and refreshes the projects' `period`
//      display string and the `order` so the homepage shows
//      most-recent-first with personal projects last
//      (StandUp Way → Fiberdroid → INspxt → DevBoards.io → Silent Hill Web).
//
// `down(app)` is a no-op: the added fields are harmless to keep and the
// previous (date-less) state isn't worth restoring.
//
// PB `date` fields are datetimes — values are `"YYYY-MM-01 00:00:00.000Z"`;
// an empty `ended` means the collaboration / project is ongoing.

// slug → { started, ended, order } (customers don't need a `period`).
const CUSTOMER_DATES = {
  nuovavita: { started: '2023-05-01 00:00:00.000Z', ended: '2026-02-01 00:00:00.000Z', order: 1 },
  fiberdroid: { started: '2019-03-01 00:00:00.000Z', ended: '2021-02-01 00:00:00.000Z', order: 2 },
  'tc2-group': { started: '2019-01-01 00:00:00.000Z', ended: '2020-08-01 00:00:00.000Z', order: 3 },
  formafarm: { started: '2018-05-01 00:00:00.000Z', ended: '2019-06-01 00:00:00.000Z', order: 4 },
  kotuko: { started: '2015-07-01 00:00:00.000Z', ended: '2017-11-01 00:00:00.000Z', order: 5 },
  'alcos-digital': { started: '2014-02-01 00:00:00.000Z', ended: '2015-07-01 00:00:00.000Z', order: 6 },
  proxime: { started: '2010-10-01 00:00:00.000Z', ended: '2014-01-01 00:00:00.000Z', order: 7 },
};

// slug → { started, ended, period, order }.
const PROJECT_DATES = {
  'standup-way-platform': { started: '2023-05-01 00:00:00.000Z', ended: '2026-02-01 00:00:00.000Z', period: '2023 — 2026', order: 1 },
  'fiberdroid-customer-area': { started: '2019-03-01 00:00:00.000Z', ended: '2021-02-01 00:00:00.000Z', period: '2019 — 2021', order: 2 },
  inspxt: { started: '2019-01-01 00:00:00.000Z', ended: '2020-08-01 00:00:00.000Z', period: '2019 — 2020', order: 3 },
  'devboards-io': { started: '2024-06-01 00:00:00.000Z', ended: '', period: '2024 — present', order: 4 },
  'silent-hill-web': { started: '2022-09-01 00:00:00.000Z', ended: '2023-06-01 00:00:00.000Z', period: '2022 — 2023', order: 5 },
};

migrate(
  (app) => {
    // ── 1. schema: ensure `started` / `ended` exist on both collections ───
    const addDates = (collection) => {
      collection.fields.add(new Field({ type: 'date', name: 'started' }));
      collection.fields.add(new Field({ type: 'date', name: 'ended' }));
      app.save(collection);
    };
    const customers = app.findCollectionByNameOrId('customers');
    addDates(customers);
    const projects = app.findCollectionByNameOrId('projects');
    addDates(projects);

    // ── 2. data: stamp the dates / period / order on existing records ─────
    for (const [slug, d] of Object.entries(CUSTOMER_DATES)) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('customers', 'slug = {:slug}', { slug });
      } catch {
        continue; // fresh DB without this row yet — the seed migration handles it
      }
      rec.set('started', d.started);
      rec.set('ended', d.ended);
      rec.set('order', d.order);
      app.save(rec);
    }

    for (const [slug, d] of Object.entries(PROJECT_DATES)) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('projects', 'slug = {:slug}', { slug });
      } catch {
        continue;
      }
      rec.set('started', d.started);
      rec.set('ended', d.ended);
      rec.set('period', d.period);
      rec.set('order', d.order);
      app.save(rec);
    }
  },
  (app) => {
    // No-op — keeping the `started`/`ended` fields and the updated values is
    // harmless, and the previous date-less state isn't worth restoring.
  },
);
