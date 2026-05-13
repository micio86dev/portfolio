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
        body_en: '<p>This site is a personal portfolio, built to collect as little data as possible.</p><h2>What is stored in your browser</h2><p>One functional item only: <code>miciodev-theme</code> in <code>localStorage</code> — your light/dark theme preference. It is set by this site, kept until you clear your browser storage, and never shared with anyone.</p><h2>The contact form</h2><p>If you use the contact form, the name, email address, subject and message you type are sent to this site\'s own PocketBase backend so your message can reach me. Nothing else is sent, and the data is not used for any other purpose.</p><h2>What this site does not do</h2><ul><li>No analytics, no tracking, no advertising.</li><li>No third-party cookies, pixels or embeds.</li><li>No profiling; no data sold or shared with third parties.</li></ul><h2>Contact</h2><p>Questions about your data? Use the contact form on this site.</p><p><em>This page is informational and is not legal advice.</em></p>',
        body_it: '<p>Questo sito è un portfolio personale, pensato per raccogliere meno dati possibile.</p><h2>Cosa viene salvato nel tuo browser</h2><p>Un solo elemento funzionale: <code>miciodev-theme</code> in <code>localStorage</code> — la tua preferenza di tema chiaro/scuro. È impostato da questo sito, conservato finché non svuoti l\'archivio del browser e mai condiviso con nessuno.</p><h2>Il modulo di contatto</h2><p>Se usi il modulo di contatto, nome, indirizzo email, oggetto e messaggio che scrivi vengono inviati al backend PocketBase di questo sito affinché il messaggio arrivi a me. Non viene inviato altro e i dati non vengono usati per altri scopi.</p><h2>Cosa questo sito non fa</h2><ul><li>Niente analitica, niente tracciamento, niente pubblicità.</li><li>Nessun cookie, pixel o embed di terze parti.</li><li>Nessuna profilazione; nessun dato venduto o condiviso con terzi.</li></ul><h2>Contatti</h2><p>Domande sui tuoi dati? Usa il modulo di contatto di questo sito.</p><p><em>Questa pagina è informativa e non costituisce consulenza legale.</em></p>',
        body_es: '<p>Este sitio es un portfolio personal, hecho para recoger la menor cantidad de datos posible.</p><h2>Qué se guarda en tu navegador</h2><p>Un único elemento funcional: <code>miciodev-theme</code> en <code>localStorage</code> — tu preferencia de tema claro/oscuro. Lo establece este sitio, se conserva hasta que borres el almacenamiento del navegador y nunca se comparte con nadie.</p><h2>El formulario de contacto</h2><p>Si usas el formulario de contacto, el nombre, la dirección de correo, el asunto y el mensaje que escribes se envían al backend PocketBase de este sitio para que tu mensaje llegue hasta mí. No se envía nada más y los datos no se usan para ningún otro fin.</p><h2>Qué no hace este sitio</h2><ul><li>Sin analítica, sin rastreo, sin publicidad.</li><li>Sin cookies, píxeles o incrustaciones de terceros.</li><li>Sin perfilado; ningún dato vendido o compartido con terceros.</li></ul><h2>Contacto</h2><p>¿Preguntas sobre tus datos? Usa el formulario de contacto de este sitio.</p><p><em>Esta página es informativa y no constituye asesoramiento legal.</em></p>',
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
