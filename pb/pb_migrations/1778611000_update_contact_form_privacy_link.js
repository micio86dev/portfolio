/// <reference path="../pb_data/types.d.ts" />

// The contact form's privacy line now contains a real hyperlink to the privacy
// policy (GDPR/ePrivacy: a reachable notice at the point of data collection).
// `contact.form.privacy` gains a `{link}` placeholder and a new
// `contact.form.privacyLinkText` row holds the linked text. The frontend
// (ContactForm.vue) splits the sentence around `{link}` and renders an <a>.
//
// `up()` is an idempotent UPSERT (update if the `key` row exists, else create);
// it runs after 1778600100_created_translations.js (which seeded the old, plain
// `contact.form.privacy`) and is safe on a fresh DB and re-runnable. `down()`
// restores the previous plain sentence and drops the new key.

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('translations');

    const rows = [
      {
        key: 'contact.form.privacy',
        group: 'contact',
        en: 'By sending this you accept the {link}.',
        it: 'Inviando accetti la {link}.',
        es: 'Al enviar aceptas la {link}.',
      },
      {
        key: 'contact.form.privacyLinkText',
        group: 'contact',
        en: 'privacy policy',
        it: 'privacy policy',
        es: 'política de privacidad',
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
    try {
      const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', {
        key: 'contact.form.privacy',
      });
      rec.set('en', 'By sending this you accept the privacy policy.');
      rec.set('it', 'Inviando accetti la privacy policy.');
      rec.set('es', 'Al enviar aceptas la política de privacidad.');
      app.save(rec);
    } catch (_) {
      /* nothing to restore */
    }
    try {
      const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', {
        key: 'contact.form.privacyLinkText',
      });
      app.delete(rec);
    } catch (_) {
      /* already gone */
    }
  },
);
