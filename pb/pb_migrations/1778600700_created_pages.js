/// <reference path="../pb_data/types.d.ts" />

// `pages` — arbitrary trilingual content pages (legal pages and the like:
// /privacy, /imprint, …). One row per page, with `title_*` / `body_*` columns
// for en / it / es (body is rich text — store HTML). `published` gates
// visibility; `order` is for the admin list / any future index. The Astro
// frontend reads this via getPage(slug, locale) / getPages(locale) on each
// request and falls back to PAGES_SEED if PocketBase is unreachable.
//
// SEED: two placeholder rows — `privacy` and `imprint` — published, with
// clearly-marked PLACEHOLDER copy in all three languages. Replace the body
// with the real legal text from the admin.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'pages',
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
        { type: 'text', name: 'slug', required: true, max: 100, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'bool', name: 'published' },
        { type: 'text', name: 'title_en', required: true, max: 200 },
        { type: 'text', name: 'title_it', max: 200 },
        { type: 'text', name: 'title_es', max: 200 },
        { type: 'editor', name: 'body_en' },
        { type: 'editor', name: 'body_it' },
        { type: 'editor', name: 'body_es' },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_pages_slug` ON `pages` (`slug`)'],
    });

    app.save(collection);

    const rows = [
      {
        slug: 'privacy', order: 1, published: true,
        title_en: 'Privacy Policy',
        title_it: 'Informativa sulla privacy',
        title_es: 'Política de privacidad',
        body_en: '<p><strong>Placeholder.</strong> This is placeholder copy — replace it with the real privacy policy from the admin (collection <code>pages</code>, slug <code>privacy</code>).</p>',
        body_it: '<p><strong>Segnaposto.</strong> Questo è testo segnaposto — sostituiscilo con l\'informativa sulla privacy reale dall\'admin (collezione <code>pages</code>, slug <code>privacy</code>).</p>',
        body_es: '<p><strong>Marcador de posición.</strong> Este es un texto provisional — reemplázalo con la política de privacidad real desde el panel (colección <code>pages</code>, slug <code>privacy</code>).</p>',
      },
      {
        slug: 'imprint', order: 2, published: true,
        title_en: 'Imprint',
        title_it: 'Note legali',
        title_es: 'Aviso legal',
        body_en: '<p><strong>Placeholder.</strong> This is placeholder copy — replace it with the real imprint / legal notice from the admin (collection <code>pages</code>, slug <code>imprint</code>).</p>',
        body_it: '<p><strong>Segnaposto.</strong> Questo è testo segnaposto — sostituiscilo con le note legali reali dall\'admin (collezione <code>pages</code>, slug <code>imprint</code>).</p>',
        body_es: '<p><strong>Marcador de posición.</strong> Este es un texto provisional — reemplázalo con el aviso legal real desde el panel (colección <code>pages</code>, slug <code>imprint</code>).</p>',
      },
    ];

    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pages');
    return app.delete(collection);
  },
);
