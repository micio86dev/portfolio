/// <reference path="../pb_data/types.d.ts" />

// Flip the long-form fields on `customers` from `text` → `editor` so the PB
// admin shows the same WYSIWYG used by `pages.body_*` / `news.body_*`. Affects:
//   - description_en / description_it / description_es
//   - testimonial_en / testimonial_it / testimonial_es
//
// PocketBase explicitly disallows changing a field's `type` in place ("Field
// type cannot be changed."), so we drop each field and re-add it under the
// same name with the new type. PB assigns the new field a fresh id, and the
// underlying SQLite column is dropped+recreated by `app.save(collection)`. We
// snapshot the row data BEFORE the schema swap and write it back AFTER, so
// existing content survives.
//
// The `editor` field stores **HTML**, but existing `description_*` rows hold
// lightweight Markdown (`**bold**`, `*italic*` / `_italic_`, `[txt](url)`,
// blank-line paragraphs) — see astro/src/lib/markdown.ts. The write-back step
// routes Markdown through an inline Markdown→HTML converter (same rules as
// `mdParagraphs`) so the WYSIWYG opens them as proper rich text instead of
// literal asterisks. Testimonials are seeded empty by
// 1778602000_seed_projects_customers.js, so they need no conversion — only
// preservation of whatever an admin may have added by hand.
//
// The frontend renderers (CustomerDetailPage.astro) have been switched in the
// same change-set to render through `renderRichText` / `renderRichTextInline`,
// which auto-detect HTML vs Markdown so the lib/seed-data.ts fallback
// (still Markdown) keeps working when PB is unreachable.
//
// down() reverses the schema swap (editor → text, max=2000) and rewinds
// existing HTML back to a best-effort Markdown using the same drop/re-add
// pattern. The reverse is lossy: anything richer than bold/italic/links/
// paragraphs that an admin may have introduced via the WYSIWYG after the up()
// will be stripped to plain text.

const ESCAPE_HTML_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ESCAPE_HTML_MAP[c]);
const escapeAttr = (s) => escapeHtml(s).replace(/'/g, '&#39;');

// Mirrors astro/src/lib/markdown.ts → mdInline / mdParagraphs. Kept inline in
// the migration so it can run inside PB's Goja JS engine without imports.
const mdToHtml = (raw) => {
  if (!raw) return '';
  const blocks = String(raw).split(/\n\s*\n/);
  const out = [];
  for (const blockRaw of blocks) {
    const block = blockRaw.trim();
    if (!block) continue;
    let s = escapeHtml(block).replace(/\s*\n\s*/g, ' ');
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^_\w])_([^_\n]+?)_(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
      const safeUrl = escapeAttr(url);
      return '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
    out.push('<p>' + s + '</p>');
  }
  return out.join('');
};

// Best-effort HTML → lightweight Markdown for down(). Handles the inline tags
// that mdToHtml could have produced; anything else falls through to plain text.
const htmlToMd = (html) => {
  if (!html) return '';
  let s = String(html);
  s = s.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  s = s.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');
  s = s.replace(/<br\s*\/?>(\s*)/gi, '\n');
  s = s.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  s = s.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  s = s.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  s = s.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  s = s.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return s.trim();
};

const FIELD_NAMES = [
  'description_en', 'description_it', 'description_es',
  'testimonial_en', 'testimonial_it', 'testimonial_es',
];
const DESCRIPTION_FIELDS = ['description_en', 'description_it', 'description_es'];

migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers');

    // 1. Snapshot the existing row data before the schema swap drops the
    //    column data with it.
    const snapshot = {};
    for (const rec of app.findAllRecords('customers')) {
      const row = {};
      for (const name of FIELD_NAMES) row[name] = rec.getString(name);
      snapshot[rec.id] = row;
    }

    // 2. Drop the text fields and re-add as editor (PB disallows in-place
    //    type change). Done in one save so PB drops+creates columns once.
    for (const name of FIELD_NAMES) customers.fields.removeByName(name);
    for (const name of FIELD_NAMES) customers.fields.add(new Field({ type: 'editor', name }));
    app.save(customers);

    // 3. Restore the data, converting Markdown descriptions to HTML so the
    //    WYSIWYG opens them as rich text rather than literal asterisks.
    for (const rec of app.findAllRecords('customers')) {
      const saved = snapshot[rec.id];
      if (!saved) continue;
      let touched = false;
      for (const name of FIELD_NAMES) {
        const raw = saved[name] || '';
        if (!raw) continue;
        const isDescription = DESCRIPTION_FIELDS.indexOf(name) !== -1;
        const value = isDescription && raw.indexOf('<') === -1 ? mdToHtml(raw) : raw;
        rec.set(name, value);
        touched = true;
      }
      if (touched) app.save(rec);
    }
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers');

    const snapshot = {};
    for (const rec of app.findAllRecords('customers')) {
      const row = {};
      for (const name of FIELD_NAMES) row[name] = rec.getString(name);
      snapshot[rec.id] = row;
    }

    for (const name of FIELD_NAMES) customers.fields.removeByName(name);
    for (const name of FIELD_NAMES) {
      customers.fields.add(new Field({ type: 'text', name, max: 2000 }));
    }
    app.save(customers);

    for (const rec of app.findAllRecords('customers')) {
      const saved = snapshot[rec.id];
      if (!saved) continue;
      let touched = false;
      for (const name of FIELD_NAMES) {
        const raw = saved[name] || '';
        if (!raw) continue;
        const isDescription = DESCRIPTION_FIELDS.indexOf(name) !== -1;
        const value = isDescription && raw.indexOf('<') !== -1 ? htmlToMd(raw) : raw;
        rec.set(name, value);
        touched = true;
      }
      if (touched) app.save(rec);
    }
  },
);
