/// <reference path="../pb_data/types.d.ts" />

// Adds the `videos.*` + `dividers.videos` UI strings to the existing
// `translations` collection (the section's headings/labels — the video
// titles themselves live in the `videos` collection, not here). Idempotent:
// each key is updated in place if it already exists, otherwise created.
//
// down(): removes the rows this migration added.

const ROWS = [
  { key: 'videos.eyebrow', group: 'videos', en: '§ 04c · Videos', it: '§ 04c · Video', es: '§ 04c · Vídeos' },
  { key: 'videos.title', group: 'videos', en: 'From the YouTube channel', it: 'Dal canale YouTube', es: 'Desde el canal de YouTube' },
  { key: 'videos.meta', group: 'videos', en: 'Hand-picked · YouTube', it: 'Selezione · YouTube', es: 'Selección · YouTube' },
  { key: 'videos.watch', group: 'videos', en: 'Watch on YouTube', it: 'Guarda su YouTube', es: 'Ver en YouTube' },
  { key: 'dividers.videos', group: 'dividers', en: '§ 04c — Videos', it: '§ 04c — Video', es: '§ 04c — Vídeos' },
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
