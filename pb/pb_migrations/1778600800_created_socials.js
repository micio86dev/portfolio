/// <reference path="../pb_data/types.d.ts" />

// `socials` — the social links rendered in the footer (§ "Elsewhere"). One row
// per link:
//   - `icon`  — select; one of the keys the footer knows how to draw. Keep this
//               list in sync with `SocialIcon` in
//               `astro/src/lib/seed-data.ts` and the `ICONS` map in
//               `astro/src/components/astro/Footer.astro`. To add a platform:
//               add the key here (in a new migration), add the SVG to Footer,
//               and add the key to the seed-data union.
//   - `url`   — the profile URL (https://…).
//   - `label` — short platform name, e.g. "GitHub". Used for the link's
//               `title` attribute and (with the translated "external link"
//               suffix) its `aria-label` — i.e. the alt/title text for SEO and
//               accessibility. Not translated (platform names are universal).
//   - `order` — manual sort, lower = first. The admin can reorder these by
//               drag & drop at `/{pb}/socials-order` (served by
//               `pb/pb_hooks/socials_order.pb.js`), which just rewrites this
//               column.
//
// The Astro frontend reads this via `getSocials()` on each request and falls
// back to `SOCIALS_SEED` if PocketBase is unreachable.
//
// API rules: public read; writes superusers-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'socials',
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
        {
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
        },
        { type: 'url', name: 'url', required: true },
        { type: 'text', name: 'label', required: true, max: 60 },
        { type: 'number', name: 'order', onlyInt: true },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX `idx_socials_order` ON `socials` (`order`)'],
    });

    app.save(collection);

    // Seed MicioDev's real social profiles (source: data/socials.md). Order is
    // dev-first: GitHub, LinkedIn, then the media channels, Udemy last. The
    // admin can reorder via /{pb}/socials-order.
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
    const collection = app.findCollectionByNameOrId('socials');
    return app.delete(collection);
  },
);
