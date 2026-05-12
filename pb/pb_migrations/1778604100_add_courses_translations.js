/// <reference path="../pb_data/types.d.ts" />

// Adds the `courses.*` + `dividers.courses` UI strings to the existing
// `translations` collection (for instances that were already migrated past
// 1778600100, which now also seeds these rows for fresh deploys). Idempotent:
// each key is updated in place if it already exists, otherwise created.
//
// down(): removes the rows this migration added.

const ROWS = [
  { key: 'courses.eyebrow', group: 'courses', en: '§ 04b · Courses', it: '§ 04b · Corsi', es: '§ 04b · Cursos' },
  { key: 'courses.title', group: 'courses', en: 'Courses I teach, in three tracks', it: 'Corsi che insegno, in tre percorsi', es: 'Cursos que imparto, en tres vías' },
  { key: 'courses.meta', group: 'courses', en: 'Three courses · Udemy & YouTube', it: 'Tre corsi · Udemy e YouTube', es: 'Tres cursos · Udemy y YouTube' },
  { key: 'courses.viewCourse', group: 'courses', en: 'View course', it: 'Vai al corso', es: 'Ir al curso' },
  { key: 'courses.platform.udemy', group: 'courses', en: 'Udemy', it: 'Udemy', es: 'Udemy' },
  { key: 'courses.platform.youtube', group: 'courses', en: 'YouTube', it: 'YouTube', es: 'YouTube' },
  { key: 'dividers.courses', group: 'dividers', en: '§ 04b — Courses', it: '§ 04b — Corsi', es: '§ 04b — Cursos' },
];

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('translations');
    for (const row of ROWS) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key: row.key });
      } catch {
        rec = new Record(collection);
      }
      rec.set('key', row.key);
      rec.set('group', row.group);
      rec.set('en', row.en);
      rec.set('it', row.it);
      rec.set('es', row.es);
      app.save(rec);
    }
  },
  (app) => {
    for (const row of ROWS) {
      try {
        const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key: row.key });
        app.delete(rec);
      } catch {
        // not present — nothing to undo
      }
    }
  },
);
