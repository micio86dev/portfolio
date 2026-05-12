/// <reference path="../pb_data/types.d.ts" />

// Adds the home-page "colophon" (built-with) copy to the `translations`
// collection: the section-divider label plus the eyebrow / title / body /
// CTA label / repo URL for the new Colophon section. These are UI strings, so
// they live alongside the rest of the site copy in `translations` and can be
// edited from the admin (/_/) with no redeploy.
//
// `up()` is an idempotent UPSERT: it updates the row if a record with that
// `key` already exists, otherwise creates it. That makes this safe on a fresh
// DB (it runs after 1778600100_created_translations.js, which doesn't include
// these keys) and re-runnable.
//
// `down()` is intentionally a no-op — see the commented block below for a
// delete-the-rows variant if you ever want a true rollback.

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('translations');

    const rows = [
      {
        key: 'dividers.colophon',
        group: 'dividers',
        en: '§ 06 — Colophon',
        it: '§ 06 — Colophon',
        es: '§ 06 — Colofón',
      },
      {
        key: 'colophon.eyebrow',
        group: 'colophon',
        en: '§ 06 · Colophon',
        it: '§ 06 · Colophon',
        es: '§ 06 · Colofón',
      },
      {
        key: 'colophon.title',
        group: 'colophon',
        en: 'Built in the open',
        it: 'Costruito in chiaro',
        es: 'Hecho a la vista',
      },
      {
        key: 'colophon.body',
        group: 'colophon',
        en: 'This portfolio runs on Astro with hybrid SSR, a self-hosted PocketBase backend, Docker for packaging, and CI/CD through GitHub Actions — built with Claude Code, in the open.',
        it: 'Questo portfolio gira su Astro con SSR ibrido, un backend PocketBase self-hosted, Docker per il packaging e CI/CD tramite GitHub Actions — realizzato con Claude Code, a carte scoperte.',
        es: 'Este portfolio funciona con Astro y SSR híbrido, un backend PocketBase autoalojado, Docker para el empaquetado y CI/CD mediante GitHub Actions — hecho con Claude Code, a la vista de todos.',
      },
      {
        key: 'colophon.repoCta',
        group: 'colophon',
        en: 'View the source ↗',
        it: 'Vedi il codice ↗',
        es: 'Ver el código ↗',
      },
      {
        key: 'colophon.repoUrl',
        group: 'colophon',
        en: 'https://github.com/micio86dev/itjobhub-antigravity-config',
        it: 'https://github.com/micio86dev/itjobhub-antigravity-config',
        es: 'https://github.com/micio86dev/itjobhub-antigravity-config',
      },
    ];

    for (const row of rows) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key: row.key });
      } catch (_) {
        rec = null;
      }
      if (!rec) rec = new Record(collection);
      rec.set('key', row.key);
      rec.set('group', row.group);
      rec.set('en', row.en);
      rec.set('it', row.it);
      rec.set('es', row.es);
      app.save(rec);
    }
  },
  (app) => {
    // No-op rollback — the colophon copy is harmless to leave behind.
    //
    // To make it a true rollback, delete the rows instead:
    //
    // const keys = [
    //   'dividers.colophon',
    //   'colophon.eyebrow',
    //   'colophon.title',
    //   'colophon.body',
    //   'colophon.repoCta',
    //   'colophon.repoUrl',
    // ];
    // for (const key of keys) {
    //   try {
    //     const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key });
    //     app.delete(rec);
    //   } catch (_) { /* already gone */ }
    // }
  },
);
