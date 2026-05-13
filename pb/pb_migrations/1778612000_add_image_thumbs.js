/// <reference path="../pb_data/types.d.ts" />

// Pre-declare the thumbnail sizes PocketBase will generate on-demand for our
// image file fields. PB **only honours `?thumb=<spec>` for sizes listed here**;
// unknown specs are silently dropped and the original file is served unchanged
// — that's exactly what PageSpeed flagged ("rendered 32×32, natural 512×512",
// 574 KiB recoverable). Once a thumb is registered here PB generates it the
// first time it's requested and caches it on disk, so subsequent requests are
// fast and bandwidth-cheap.
//
// Sizes (kept tight; each `<img>` call-site uses one of these specs):
//   - `customers.logo`     : `64x64f`, `128x128f`
//     Hero trust strip (32 px display ⇒ 64 px @ 2×) and ProjectCard crest
//     fallback (36 px ⇒ 72 px @ 2×, rounded up to 128 to keep one spec).
//   - `projects.logo`      : `64x64f`, `128x128f`
//     ProjectCard crest (same display sizes as above).
//   - `customers.images`   : `720x450t`, `1024x640t`, `1280x800t`, `1280x800f`, `800x500f`
//     CustomerDetailPage hero (`1280x800f`) + gallery shots (`800x500f`); the
//     three `t` (top-anchored crop) sizes match the project-card `srcset` for
//     consistency with any future customer card.
//   - `projects.images`    : `720x450t`, `1024x640t`, `1280x800t`, `1280x800f`, `800x500f`
//     `pcard__shot` srcset (mobile / desktop / retina) + ProjectDetailPage hero
//     (`1280x800f`) and gallery shots (`800x500f`).
//
// `WxHt` (top-anchored crop) preserves the screenshot's header / chrome (the
// most informative part); `WxHf` (fit) preserves logos without cropping.
//
// `collection.fields.add(new Field({...}))` REPLACES a same-named field, so the
// migration is idempotent across fresh databases and instances already past
// `1778600300_created_projects.js` / `1778600600_created_customers.js` /
// `1778610000_add_projects_logo.js`. `down()` re-writes the same fields with
// the `thumbs` removed.
//
// Note: PB doesn't transcode formats — a PNG stays a PNG after thumbing. The
// largest single win in PageSpeed's report (a 514 KiB screenshot) requires the
// source to be re-uploaded as WebP/AVIF/JPEG via the admin UI. This migration
// is the structural fix; the format swap is a content-side task.

migrate(
  (app) => {
    // ── customers ────────────────────────────────────────────────────────
    {
      const customers = app.findCollectionByNameOrId('customers');
      customers.fields.add(
        new Field({
          type: 'file',
          name: 'logo',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
          thumbs: ['64x64f', '128x128f'],
        }),
      );
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

    // ── projects ─────────────────────────────────────────────────────────
    {
      const projects = app.findCollectionByNameOrId('projects');
      projects.fields.add(
        new Field({
          type: 'file',
          name: 'logo',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
          thumbs: ['64x64f', '128x128f'],
        }),
      );
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
  (app) => {
    // Restore the previous (thumb-less) field definitions.
    {
      const customers = app.findCollectionByNameOrId('customers');
      customers.fields.add(
        new Field({
          type: 'file',
          name: 'logo',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
        }),
      );
      customers.fields.add(
        new Field({
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
        }),
      );
      app.save(customers);
    }
    {
      const projects = app.findCollectionByNameOrId('projects');
      projects.fields.add(
        new Field({
          type: 'file',
          name: 'logo',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
        }),
      );
      projects.fields.add(
        new Field({
          type: 'file',
          name: 'images',
          maxSelect: 12,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
        }),
      );
      app.save(projects);
    }
  },
);
