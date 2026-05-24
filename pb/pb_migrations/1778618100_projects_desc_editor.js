/// <reference path="../pb_data/types.d.ts" />

// Flip `projects.desc_en` / `desc_it` / `desc_es` from `text` → `editor` so the
// PB admin shows the same WYSIWYG used by `pages.body_*`. See the companion
// migration 1778618000_customers_descriptions_editor.js for the broader
// rationale, the Markdown→HTML conversion approach, and the frontend renderer
// switch (set:html instead of mdParagraphs()).
//
// `desc_en` keeps `required: true` (carried over from the original
// 1778600300_created_projects.js). The other two locales are optional.

const ESCAPE_HTML_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ESCAPE_HTML_MAP[c]);
const escapeAttr = (s) => escapeHtml(s).replace(/'/g, '&#39;');

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

migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects');

    projects.fields.add(new Field({ type: 'editor', name: 'desc_en', required: true }));
    projects.fields.add(new Field({ type: 'editor', name: 'desc_it' }));
    projects.fields.add(new Field({ type: 'editor', name: 'desc_es' }));
    app.save(projects);

    const rows = app.findAllRecords('projects');
    for (const rec of rows) {
      let touched = false;
      for (const name of ['desc_en', 'desc_it', 'desc_es']) {
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
    const projects = app.findCollectionByNameOrId('projects');

    projects.fields.add(new Field({ type: 'text', name: 'desc_en', required: true, max: 4000 }));
    projects.fields.add(new Field({ type: 'text', name: 'desc_it', max: 4000 }));
    projects.fields.add(new Field({ type: 'text', name: 'desc_es', max: 4000 }));
    app.save(projects);

    const rows = app.findAllRecords('projects');
    for (const rec of rows) {
      let touched = false;
      for (const name of ['desc_en', 'desc_it', 'desc_es']) {
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
