/**
 * Minimal Markdown renderer for PocketBase plain-text fields (currently only
 * `career.role_*` descriptions). The admin can sprinkle lightweight Markdown —
 * bold, italic, links — to anchor the reader's eye in long copy.
 *
 * `news.body_*`, `pages.body_*`, `customers.description_*` /
 * `customers.testimonial_*`, and `projects.desc_*` all use PB's `editor`
 * field, which stores full HTML and is rendered via `set:html` directly — NOT
 * routed through here. `htmlInlineExcerpt` flattens such editor HTML into an
 * inline run for single-line card previews.
 *
 * Supported syntax:
 *   - **bold**
 *   - *italic* / _italic_
 *   - [text](https://url)
 *   - blank line ⇒ paragraph break (mdParagraphs only)
 *
 * Anything else is treated as text and HTML-escaped. Output is safe to drop
 * into `set:html` because we escape first and then re-introduce only the
 * specific tags above.
 */
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escapeAttr = (s: string): string =>
  escapeHtml(s).replace(/'/g, '&#39;');

/** Inline-only: escapes HTML, then expands `**bold**`, `*italic*`, `[text](url)`.
 *  Use this for one-line fields (e.g. cards) where paragraph breaks shouldn't
 *  appear visually. Single `\n` is collapsed to a space. */
export const mdInline = (raw: string): string => {
  if (!raw) return '';
  let s = escapeHtml(raw).replace(/\s*\n\s*/g, ' ');

  // **bold** — must come before single-*, so that "**x**" doesn't get parsed
  // as an empty italic wrapping a bold token.
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');

  // *italic* and _italic_ — keep simple; no nesting.
  s = s.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_\w])_([^_\n]+?)_(?!\w)/g, '$1<em>$2</em>');

  // [label](https://example.com) — external links open in a new tab.
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const safeUrl = escapeAttr(url);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  return s;
};

/** Paragraph-aware version: splits on blank lines and wraps each block in `<p>`.
 *  Use this for long-form body copy backed by plain-text Markdown fields
 *  (currently only `career.role_*`). */
export const mdParagraphs = (raw: string): string => {
  if (!raw) return '';
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${mdInline(block)}</p>`)
    .join('');
};

/** Flatten editor-field HTML into a single inline run for card-sized previews.
 *  Strips `<p>` wrappers (joining blocks with a space) and removes any other
 *  block-level tags, preserving inline ones (`<strong>`, `<em>`, `<a>`, …).
 *  Output is already HTML-safe (it came from the editor) and is meant for
 *  `set:html` inside a single `<p>` on the card. */
export const htmlInlineExcerpt = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>(\s*)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/** Long-form copy from a PB editor field (HTML) OR the legacy Markdown source
 *  in lib/seed-data.ts. If the input contains `<`, treat it as HTML and pass
 *  through; otherwise run it through `mdParagraphs`. Keeps the seed-data
 *  fallback working without rewriting every string to HTML. */
export const renderRichText = (raw: string): string => {
  if (!raw) return '';
  return raw.indexOf('<') === -1 ? mdParagraphs(raw) : raw;
};

/** Inline single-line excerpt from either HTML or Markdown source. Mirror of
 *  `renderRichText` for card-sized previews — HTML gets flattened with
 *  `htmlInlineExcerpt`, Markdown gets parsed with `mdInline`. */
export const renderRichTextInline = (raw: string): string => {
  if (!raw) return '';
  return raw.indexOf('<') === -1 ? mdInline(raw) : htmlInlineExcerpt(raw);
};
