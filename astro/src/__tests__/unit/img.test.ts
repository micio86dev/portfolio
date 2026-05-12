import { describe, it, expect } from 'vitest';
import { pbThumb } from '../../lib/img';

describe('pbThumb', () => {
  it('appends a ?thumb= query to a bare remote URL', () => {
    expect(pbThumb('https://pb.dev/api/files/x/y/cover.webp', '128x128f')).toBe(
      'https://pb.dev/api/files/x/y/cover.webp?thumb=128x128f',
    );
  });

  it('uses & when the URL already has a query string', () => {
    expect(pbThumb('https://pb.dev/files/cover.webp?token=abc', '100x100')).toBe(
      'https://pb.dev/files/cover.webp?token=abc&thumb=100x100',
    );
  });

  it('is a no-op for blank input', () => {
    expect(pbThumb('', '100x100')).toBe('');
    expect(pbThumb(undefined, '100x100')).toBe('');
    expect(pbThumb(null, '100x100')).toBe('');
  });

  it('leaves non-http(s) URLs unchanged', () => {
    expect(pbThumb('/local/cover.webp', '100x100')).toBe('/local/cover.webp');
    expect(pbThumb('data:image/png;base64,AAAA', '100x100')).toBe('data:image/png;base64,AAAA');
  });

  it('refuses to thumbnail SVGs', () => {
    expect(pbThumb('https://pb.dev/files/logo.svg', '64x64')).toBe('https://pb.dev/files/logo.svg');
    expect(pbThumb('https://pb.dev/files/logo.svgz?token=x', '64x64')).toBe(
      'https://pb.dev/files/logo.svgz?token=x',
    );
  });
});
