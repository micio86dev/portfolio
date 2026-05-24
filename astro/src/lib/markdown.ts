/**
 * Minimal Markdown renderer for PocketBase plain-text fields (project / customer
 * / career descriptions). PB stores these as plain text; the admin can sprinkle
 * lightweight Markdown — bold, italic, links — to anchor the reader's eye in
 * long copy. News (`news.body_*`) and Pages (`pages.body_*`) use PB's `editor`
 * field, which is full HTML, and are NOT routed through here.
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
 *  Use this for long-form body copy (project / customer detail pages). */
export const mdParagraphs = (raw: string): string => {
  if (!raw) return '';
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${mdInline(block)}</p>`)
    .join('');
};
