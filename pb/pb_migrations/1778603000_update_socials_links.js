/// <reference path="../pb_data/types.d.ts" />

// Replace the placeholder `socials` seed (created by 1778600800_created_socials.js)
// with MicioDev's real social profiles (source: data/socials.md), and widen the
// `icon` select to cover the platforms now in use (`tiktok`, `udemy`).
//
// Why a separate migration: 1778600800 already ran on existing instances with
// the three placeholder rows and the narrower `icon` value list — so the real
// content + the new `icon` values have to be applied as a forward step.
//
// `up()` is written to be idempotent and safe on a fresh DB too: `fields.add()`
// REPLACES a same-named field (so re-asserting `icon` with the expanded values
// is a no-op when 1778600800 already declared the wider list), and it always
// wipes the collection before inserting — deleting from an already-empty
// `socials` is fine, and running on top of the old placeholder seed leaves a
// clean, deterministic result.

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('socials');

    // ── schema: re-assert `icon` with the expanded value list ──────────────
    collection.fields.add(
      new Field({
        type: 'select',
        name: 'icon',
        required: true,
        maxSelect: 1,
        values: [
          'github',
          'gitlab',
          'linkedin',
          'x',
          'instagram',
          'facebook',
          'youtube',
          'tiktok',
          'udemy',
          'codepen',
          'dribbble',
          'telegram',
          'mastodon',
          'email',
          'rss',
          'website',
        ],
      }),
    );
    app.save(collection);

    // ── wipe the collection (drops the old placeholder seed) ───────────────
    for (const r of app.findAllRecords('socials')) app.delete(r);

    // ── re-insert: MicioDev's real profiles, dev-first ordering ────────────
    const rows = [
      { icon: 'github', url: 'https://github.com/micio86dev', label: 'GitHub', order: 1 },
      { icon: 'linkedin', url: 'https://linkedin.com/in/miciodev', label: 'LinkedIn', order: 2 },
      { icon: 'youtube', url: 'https://youtube.com/@miciodev', label: 'YouTube', order: 3 },
      { icon: 'instagram', url: 'https://instagram.com/miciodev', label: 'Instagram', order: 4 },
      { icon: 'tiktok', url: 'https://tiktok.com/@miciodev', label: 'TikTok', order: 5 },
      { icon: 'facebook', url: 'https://facebook.com/profile.php?id=61576394360974', label: 'Facebook', order: 6 },
      { icon: 'udemy', url: 'https://www.udemy.com/user/alessandro-micelli', label: 'Udemy', order: 7 },
    ];
    for (const row of rows) {
      app.save(new Record(collection, row));
    }
  },
  (app) => {
    // Irreversible content seed — the previous placeholder links aren't worth
    // restoring, and the extra `icon` values are harmless to keep. No-op.
  },
);
