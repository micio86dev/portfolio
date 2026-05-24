/// <reference path="../pb_data/types.d.ts" />

// Flip the long-form fields on `customers` from `text` → `editor` so the PB
// admin shows the same WYSIWYG used by `pages.body_*` / `news.body_*`. Affects:
//   - description_en / description_it / description_es
//   - testimonial_en / testimonial_it / testimonial_es
//
// The `editor` field stores **HTML**, but existing `description_*` rows hold
// lightweight Markdown (`**bold**`, `*italic*` / `_italic_`, `[txt](url)`,
// blank-line paragraphs) — see astro/src/lib/markdown.ts. So up() also rewrites
// the existing description data through an inline Markdown→HTML converter
// (same rules as mdParagraphs) so the WYSIWYG opens them as proper rich-text
// instead of literal asterisks. Testimonials are seeded empty by
// 1778602000_seed_projects_customers.js, so they need no data conversion.
//
// The frontend renderers (CustomerDetailPage.astro for description, and the
// testimonial block) have been switched in the same change-set from
// mdParagraphs() to `set:html` directly — so post-migration the page renders
// the stored HTML as-is.
//
// `fields.add(new Field({...}))` REPLACES a same-named field; the underlying
// SQLite TEXT column is shared between `text` and `editor` types, so row data
// survives the schema swap untouched (we still rewrite descriptions inside the
// same transaction, after the field replace, with the HTML form).
//
// down() flips the fields back to `text` (with the original max=2000 cap) and
// rewinds `description_*` from HTML to a best-effort Markdown form. The
// reverse is lossy: anything richer than bold/italic/links/paragraphs that an
// admin may have introduced via the WYSIWYG after the up() will be stripped to
// plain text. Acceptable for a forward-only content schema.

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

const DESCRIPTION_FIELDS = ['description_en', 'description_it', 'description_es'];
const TESTIMONIAL_FIELDS = ['testimonial_en', 'testimonial_it', 'testimonial_es'];

migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers');

    for (const name of DESCRIPTION_FIELDS) {
      customers.fields.add(new Field({ type: 'editor', name }));
    }
    for (const name of TESTIMONIAL_FIELDS) {
      customers.fields.add(new Field({ type: 'editor', name }));
    }
    app.save(customers);

    // Convert existing description Markdown → HTML in place. Testimonials are
    // empty in the seed and the editor will treat any stray plain text as a
    // single paragraph at first edit, so no rewrite needed there.
    const rows = app.findAllRecords('customers');
    for (const rec of rows) {
      let touched = false;
      for (const name of DESCRIPTION_FIELDS) {
        const raw = rec.getString(name);
        if (raw && raw.indexOf('<') === -1) {
          rec.set(name, mdToHtml(raw));
          touched = true;
        }
      }
      if (touched) app.save(rec);
    }
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers');

    for (const name of DESCRIPTION_FIELDS) {
      customers.fields.add(new Field({ type: 'text', name, max: 2000 }));
    }
    for (const name of TESTIMONIAL_FIELDS) {
      customers.fields.add(new Field({ type: 'text', name, max: 2000 }));
    }
    app.save(customers);

    const rows = app.findAllRecords('customers');
    for (const rec of rows) {
      let touched = false;
      for (const name of DESCRIPTION_FIELDS) {
        const raw = rec.getString(name);
        if (raw && raw.indexOf('<') !== -1) {
          rec.set(name, htmlToMd(raw));
          touched = true;
        }
      }
      if (touched) app.save(rec);
    }
  },
);
