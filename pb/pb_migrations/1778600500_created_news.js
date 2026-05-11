/// <reference path="../pb_data/types.d.ts" />

// `news` — long-form posts / changelog entries, carried over from the previous
// portfolio (micio86dev.it). One row per post, with `title_*` / `excerpt_*` /
// `body_*` columns for en / it / es (body is rich text — store HTML).
// `published` gates visibility; `date` is the display/sort date; `cover` is an
// optional image. The Astro frontend reads this via getNews(locale) and falls
// back to NEWS_SEED if PocketBase is unreachable.
//
// SEED: left empty here — the historical posts are loaded by a follow-up
// migration once their content has been recovered from the old site.
//
// API rules: public read of *published* rows only; writes superusers-only.
//   listRule = viewRule = "published = true"    → public read (published only)
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'news',
      listRule: 'published = true',
      viewRule: 'published = true',
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
        { type: 'text', name: 'slug', required: true, max: 120, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        { type: 'date', name: 'date', required: true },
        { type: 'bool', name: 'published' },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'file', name: 'cover', maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'] },
        { type: 'json', name: 'tags', maxSize: 2000 },
        { type: 'text', name: 'title_en', required: true, max: 200 },
        { type: 'text', name: 'title_it', max: 200 },
        { type: 'text', name: 'title_es', max: 200 },
        { type: 'text', name: 'excerpt_en', max: 500 },
        { type: 'text', name: 'excerpt_it', max: 500 },
        { type: 'text', name: 'excerpt_es', max: 500 },
        { type: 'editor', name: 'body_en' },
        { type: 'editor', name: 'body_it' },
        { type: 'editor', name: 'body_es' },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_news_slug` ON `news` (`slug`)'],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('news');
    return app.delete(collection);
  },
);
