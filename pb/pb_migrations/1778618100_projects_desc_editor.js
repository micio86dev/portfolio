/// <reference path="../pb_data/types.d.ts" />

// Flip `projects.desc_en` / `desc_it` / `desc_es` from `text` → `editor` so the
// PB admin shows the same WYSIWYG used by `pages.body_*`. See the companion
// migration 1778618000_customers_descriptions_editor.js for the full rationale
// — including why PB's "Field type cannot be changed" rule forces a drop /
// re-add + data snapshot pattern, and how the frontend renderer was switched
// (`renderRichText` / `renderRichTextInline`) to handle both HTML (DB) and
// Markdown (lib/seed-data.ts fallback).
//
// `desc_en` keeps `required: true` (carried over from the original
// 1778600300_created_projects.js). The other two locales remain optional.

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

const FIELD_NAMES = ['desc_en', 'desc_it', 'desc_es'];
const EDITOR_DEFS = [
  { name: 'desc_en', required: true },
  { name: 'desc_it' },
  { name: 'desc_es' },
];
const TEXT_DEFS = [
  { name: 'desc_en', required: true, max: 4000 },
  { name: 'desc_it', max: 4000 },
  { name: 'desc_es', max: 4000 },
];

migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects');

    const snapshot = {};
    for (const rec of app.findAllRecords('projects')) {
      const row = {};
      for (const name of FIELD_NAMES) row[name] = rec.getString(name);
      snapshot[rec.id] = row;
    }

    for (const name of FIELD_NAMES) projects.fields.removeByName(name);
    for (const def of EDITOR_DEFS) {
      projects.fields.add(new Field(Object.assign({ type: 'editor' }, def)));
    }
    app.save(projects);

    for (const rec of app.findAllRecords('projects')) {
      const saved = snapshot[rec.id];
      if (!saved) continue;
      let touched = false;
      for (const name of FIELD_NAMES) {
        const raw = saved[name] || '';
        if (!raw) continue;
        const value = raw.indexOf('<') === -1 ? mdToHtml(raw) : raw;
        rec.set(name, value);
        touched = true;
      }
      if (touched) app.save(rec);
    }
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects');

    const snapshot = {};
    for (const rec of app.findAllRecords('projects')) {
      const row = {};
      for (const name of FIELD_NAMES) row[name] = rec.getString(name);
      snapshot[rec.id] = row;
    }

    for (const name of FIELD_NAMES) projects.fields.removeByName(name);
    for (const def of TEXT_DEFS) {
      projects.fields.add(new Field(Object.assign({ type: 'text' }, def)));
    }
    app.save(projects);

    for (const rec of app.findAllRecords('projects')) {
      const saved = snapshot[rec.id];
      if (!saved) continue;
      let touched = false;
      for (const name of FIELD_NAMES) {
        const raw = saved[name] || '';
        if (!raw) continue;
        const value = raw.indexOf('<') !== -1 ? htmlToMd(raw) : raw;
        rec.set(name, value);
        touched = true;
      }
      if (touched) app.save(rec);
    }
  },
);
