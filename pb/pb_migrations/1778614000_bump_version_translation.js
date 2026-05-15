/// <reference path="../pb_data/types.d.ts" />

// Bumps the `hero.meta.version` PocketBase translation row from "v 0.1.0" to
// "v 1.0.1" in all three locales. The site moved to v1.0.1 in package.json +
// the bundled i18n JSON files, but the `translations` collection takes
// precedence over the bundled JSON via the remote overlay (see
// `src/lib/pocketbase.ts → loadTranslations` + `src/i18n/utils.ts →
// applyRemoteDictionaries`), so the stage was still rendering the old string
// until this row catches up. Idempotent: re-running it on an already-bumped
// record produces no change, and the down() restores the prior value.

migrate(
  (app) => {
    try {
      const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', {
        key: 'hero.meta.version',
      });
      rec.set('en', 'v 1.0.1');
      rec.set('it', 'v 1.0.1');
      rec.set('es', 'v 1.0.1');
      app.save(rec);
    } catch (_) {
      // No row yet (e.g. fresh DB seeded after the bump) — bundled JSON
      // already carries v 1.0.1, so nothing to do.
    }
  },
  (app) => {
    try {
      const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', {
        key: 'hero.meta.version',
      });
      rec.set('en', 'v 1.0.1');
      rec.set('it', 'v 1.0.1');
      rec.set('es', 'v 1.0.1');
      app.save(rec);
    } catch (_) {
      /* row absent — nothing to rewind */
    }
  },
);
