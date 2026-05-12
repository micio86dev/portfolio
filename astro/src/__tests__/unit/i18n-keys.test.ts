import { describe, it, expect } from 'vitest';
import en from '../../i18n/en.json';
import itDict from '../../i18n/it.json';
import es from '../../i18n/es.json';

/** Flatten a nested dictionary to dotted leaf paths (e.g. `nav.home`). */
function leafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...leafKeys(v as Record<string, unknown>, path));
    } else {
      out.push(path);
    }
  }
  return out;
}

const enKeys = leafKeys(en).sort();
const itKeys = leafKeys(itDict).sort();
const esKeys = leafKeys(es).sort();

describe('i18n dictionaries', () => {
  it('en.json has a non-trivial number of keys', () => {
    expect(enKeys.length).toBeGreaterThan(50);
  });

  it('it.json has exactly the same keys as en.json (no missing, no extra)', () => {
    const missing = enKeys.filter((k) => !itKeys.includes(k));
    const extra = itKeys.filter((k) => !enKeys.includes(k));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it('es.json has exactly the same keys as en.json (no missing, no extra)', () => {
    const missing = enKeys.filter((k) => !esKeys.includes(k));
    const extra = esKeys.filter((k) => !enKeys.includes(k));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it('every leaf value is a non-empty string in all three locales', () => {
    for (const [name, dict] of [
      ['en', en],
      ['it', itDict],
      ['es', es],
    ] as const) {
      for (const key of leafKeys(dict)) {
        const value = key
          .split('.')
          .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict);
        expect(typeof value, `${name}:${key}`).toBe('string');
        expect((value as string).length, `${name}:${key}`).toBeGreaterThan(0);
      }
    }
  });
});
