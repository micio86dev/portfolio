/// <reference path="../pb_data/types.d.ts" />

// `videos` — a small hand-picked set of YouTube videos shown in the "Videos"
// box on the home page (§ 04c). One row per video:
//   - `url`   — the YouTube watch URL (https://www.youtube.com/watch?v=… or a
//               youtu.be/… / shorts/… link). The Astro frontend extracts the
//               11-char video id from it and builds the thumbnail URL
//               (https://i.ytimg.com/vi/<id>/hqdefault.jpg) — no embed/iframe,
//               no YouTube JS, so the section costs ~one lazy <img> per card.
//               Clicking a card opens the video on YouTube in a new tab.
//   - `title` — the card title (the video's title). Not per-locale: a YouTube
//               video has one title; keep it as the creator wrote it.
//   - `order` — manual sort, lower = first. The admin can reorder these by
//               drag & drop at `/{pb}/videos-order` (served by
//               `pb/pb_hooks/videos_order.pb.js`), which just rewrites this
//               column. CRUD itself is done in the PocketBase dashboard (/_/).
//
// The Astro frontend reads this via `getVideos()` on each request and falls
// back to `VIDEOS_SEED` if PocketBase is unreachable.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'videos',
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
        { type: 'url', name: 'url', required: true },
        { type: 'text', name: 'title', required: true, max: 200 },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX `idx_videos_order` ON `videos` (`order`)'],
    });

    app.save(collection);

    // Seed a couple of real videos from the channel (@miciodev) so the box
    // isn't empty on a fresh deploy. Swap / add the picks you actually want
    // from the dashboard (/_/) or reorder at /{pb}/videos-order.
    const rows = [
      { url: 'https://www.youtube.com/watch?v=UttHm-Mwqfc', title: 'PHP da zero — la serie completa', order: 1 },
      { url: 'https://www.youtube.com/watch?v=gv0Bz48YLD4', title: 'SQL da zero — fondamenti', order: 2 },
    ];
    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('videos');
    return app.delete(collection);
  },
);
