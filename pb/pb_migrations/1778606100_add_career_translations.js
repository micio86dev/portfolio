/// <reference path="../pb_data/types.d.ts" />

// Add the UI strings for the new "About" / career-path section to the existing
// `translations` collection: the section eyebrow, title, the intro sentence,
// and the section divider label. Idempotent — for each key it updates the row
// if it already exists (e.g. on a fresh DB the rows are already seeded by
// 1778600100_created_translations.js) and creates it otherwise. The same keys
// live in the bundled i18n fallback (astro/src/i18n/*.json).
//
// `down` deletes those keys (commented out — leaving extra translation rows
// around is harmless, and the divider falls back to the bundled JSON anyway).

migrate(
  (app) => {
    const rows = [
      {
        key: 'career.eyebrow',
        group: 'career',
        en: '§ · About',
        it: '§ · Chi sono',
        es: '§ · Sobre mí',
      },
      {
        key: 'career.title',
        group: 'career',
        en: 'The path that got me here',
        it: 'Il percorso che mi ha portato qui',
        es: 'El camino que me trajo hasta aquí',
      },
      {
        key: 'career.intro',
        group: 'career',
        en: "Hi, I'm a full-stack web developer skilled in high performance.",
        it: 'Ciao, sono uno sviluppatore web full-stack con una passione per le alte prestazioni.',
        es: 'Hola, soy desarrollador web full-stack con foco en el alto rendimiento.',
      },
      {
        key: 'dividers.career',
        group: 'dividers',
        en: '§ — About',
        it: '§ — Chi sono',
        es: '§ — Sobre mí',
      },
    ];

    const collection = app.findCollectionByNameOrId('translations');

    for (const row of rows) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key: row.key });
      } catch {
        rec = new Record(collection);
        rec.set('key', row.key);
      }
      rec.set('group', row.group);
      rec.set('en', row.en);
      rec.set('it', row.it);
      rec.set('es', row.es);
      app.save(rec);
    }
  },
  (_app) => {
    // No-op. (To roll back, delete the rows whose key is in:
    //   career.eyebrow, career.title, career.intro, dividers.career)
  },
);
