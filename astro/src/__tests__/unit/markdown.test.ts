import { describe, it, expect } from 'vitest';
import { mdInline, mdParagraphs } from '../../lib/markdown';

describe('mdInline', () => {
  it('returns empty string for empty input', () => {
    expect(mdInline('')).toBe('');
  });

  it('expands **bold** to <strong>', () => {
    expect(mdInline('hello **world**')).toBe('hello <strong>world</strong>');
  });

  it('expands *italic* to <em> without eating ** pairs', () => {
    expect(mdInline('one **bold** and *soft* end')).toBe(
      'one <strong>bold</strong> and <em>soft</em> end',
    );
  });

  it('expands [label](url) to a safe external link', () => {
    expect(mdInline('see [the docs](https://example.com)')).toBe(
      'see <a href="https://example.com" target="_blank" rel="noopener noreferrer">the docs</a>',
    );
  });

  it('escapes raw HTML before applying markdown', () => {
    expect(mdInline('<script>alert(1)</script> **safe**')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt; <strong>safe</strong>',
    );
  });

  it('collapses single newlines to a space', () => {
    expect(mdInline('one\ntwo')).toBe('one two');
  });
});

describe('mdParagraphs', () => {
  it('wraps blocks separated by blank lines in <p>', () => {
    expect(mdParagraphs('first **block**\n\nsecond block')).toBe(
      '<p>first <strong>block</strong></p><p>second block</p>',
    );
  });

  it('drops empty blocks', () => {
    expect(mdParagraphs('only\n\n\n\nblock')).toBe('<p>only</p><p>block</p>');
  });

  it('returns empty string for blank input', () => {
    expect(mdParagraphs('   \n\n  ')).toBe('');
  });
});
