/// <reference path="../pb_data/types.d.ts" />

// Bumps the `footer.builtWith` PocketBase translation row from "… · v0.1.0" to
// "… · v1.0.1" in all three locales. The seed (1778600100_created_translations)
// was patched in-place when the site moved to v1.0.1, but instances that had
// already run that migration kept the old row value — the `translations`
// collection overlays the bundled i18n JSON at runtime (see
// `src/lib/pocketbase.ts → loadTranslations`), so the footer rendered "v0.1.0"
// on stage despite the bundled JSON shipping "v1.0.1". Companion to
// 1778614000_bump_version_translation.js, which did the same for
// `hero.meta.version`. Idempotent: re-running on an already-bumped record is a
// no-op.

migrate(
  (app) => {
    try {
      const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', {
        key: 'footer.builtWith',
      });
      rec.set('en', 'Built with Astro + PocketBase · v1.0.1');
      rec.set('it', 'Realizzato con Astro + PocketBase · v1.0.1');
      rec.set('es', 'Hecho con Astro + PocketBase · v1.0.1');
      app.save(rec);
    } catch (_) {
      // No row yet (e.g. fresh DB seeded after the bump) — bundled JSON
      // already carries v1.0.1, so nothing to do.
    }
  },
  (app) => {
    try {
      const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', {
        key: 'footer.builtWith',
      });
      rec.set('en', 'Built with Astro + PocketBase · v1.0.1');
      rec.set('it', 'Realizzato con Astro + PocketBase · v1.0.1');
      rec.set('es', 'Hecho con Astro + PocketBase · v1.0.1');
      app.save(rec);
    } catch (_) {
      /* row absent — nothing to rewind */
    }
  },
);
