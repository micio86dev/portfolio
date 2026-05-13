/// <reference path="../pb_data/types.d.ts" />

// Extend the `customers.images` and `projects.images` thumb specs with three
// mobile-first sizes so `pcard__shot` can serve a properly-sized image at every
// breakpoint via `srcset`. PageSpeed flagged a 514 KiB PNG screenshot rendered
// at 570×295 on mobile (natural 1648×881) — without smaller thumbs registered
// here PB silently falls back to the original file (see PB thumbs gotcha in
// `1778612000_add_image_thumbs.js`'s header), wasting ~500 KiB per project on
// the home page.
//
// New specs (prepended to keep the array roughly in mobile→desktop order):
//   - `360x225t` : mobile 1× — `pcard__shot` at 92vw on a 390 px phone ≈ 360 px
//     wide, 16:10 aspect.
//   - `480x300t` : mobile 2× retina (or 1× for the 240 px-wide three-column
//     packed render case).
//   - `600x375t` : small tablet (between phone and the existing `720x450t`).
//
// `customers.logo` / `projects.logo` are intentionally not redeclared here so
// their `64x64f`/`128x128f` thumbs from `1778612000_add_image_thumbs.js` stay
// untouched (this migration only widens the `images` srcset surface).
//
// `collection.fields.add(new Field({...}))` REPLACES a same-named field, so
// the new `thumbs` array fully overrides the previous one. `down()` rewrites
// the field with the pre-extension thumbs array.

migrate(
  (app) => {
    // ── customers ────────────────────────────────────────────────────────
    {
      const customers = app.findCollectionByNameOrId('customers');
      customers.fields.add(
        new Field({
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
          thumbs: [
            '360x225t',
            '480x300t',
            '600x375t',
            '720x450t',
            '1024x640t',
            '1280x800t',
            '1280x800f',
            '800x500f',
          ],
        }),
      );
      app.save(customers);
    }

    // ── projects ─────────────────────────────────────────────────────────
    {
      const projects = app.findCollectionByNameOrId('projects');
      projects.fields.add(
        new Field({
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
          thumbs: [
            '360x225t',
            '480x300t',
            '600x375t',
            '720x450t',
            '1024x640t',
            '1280x800t',
            '1280x800f',
            '800x500f',
          ],
        }),
      );
      app.save(projects);
    }
  },
  (app) => {
    // Restore the pre-extension thumbs array (without the three mobile sizes).
    {
      const customers = app.findCollectionByNameOrId('customers');
      customers.fields.add(
        new Field({
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
          thumbs: ['720x450t', '1024x640t', '1280x800t', '1280x800f', '800x500f'],
        }),
      );
      app.save(customers);
    }
    {
      const projects = app.findCollectionByNameOrId('projects');
      projects.fields.add(
        new Field({
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
          thumbs: ['720x450t', '1024x640t', '1280x800t', '1280x800f', '800x500f'],
        }),
      );
      app.save(projects);
    }
  },
);
