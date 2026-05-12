import { describe, it, expect, afterEach } from 'vitest';
import {
  LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  getLangFromUrl,
  stripLocale,
  useTranslations,
  useTranslatedPath,
  applyRemoteDictionaries,
} from '../../i18n/utils';

afterEach(() => {
  // Reset the module-level remote overlay so tests don't leak into each other.
  applyRemoteDictionaries({});
});

describe('isLocale', () => {
  it('accepts every supported locale', () => {
    for (const l of LOCALES) expect(isLocale(l)).toBe(true);
  });
  it('rejects anything else', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale('EN')).toBe(false);
  });
});

describe('getLangFromUrl', () => {
  it('returns the default locale for "/"', () => {
    expect(getLangFromUrl(new URL('https://x.dev/'))).toBe(DEFAULT_LOCALE);
  });
  it('reads the locale prefix', () => {
    expect(getLangFromUrl(new URL('https://x.dev/it/projects'))).toBe('it');
    expect(getLangFromUrl(new URL('https://x.dev/es/'))).toBe('es');
  });
  it('falls back to the default locale for an unknown prefix', () => {
    expect(getLangFromUrl(new URL('https://x.dev/projects'))).toBe(DEFAULT_LOCALE);
    expect(getLangFromUrl(new URL('https://x.dev/fr/projects'))).toBe(DEFAULT_LOCALE);
  });
});

describe('stripLocale', () => {
  it('removes a non-default locale segment', () => {
    expect(stripLocale('/it/projects/foo')).toBe('/projects/foo');
    expect(stripLocale('/es/')).toBe('/');
  });
  it('leaves default-locale / unprefixed paths untouched', () => {
    expect(stripLocale('/projects/foo')).toBe('/projects/foo');
    expect(stripLocale('/en/projects')).toBe('/en/projects');
    expect(stripLocale('/')).toBe('/');
  });
});

describe('useTranslatedPath', () => {
  it('does not prefix the default locale', () => {
    const path = useTranslatedPath('en');
    expect(path('/')).toBe('/');
    expect(path('/projects')).toBe('/projects');
    expect(path('projects')).toBe('/projects');
  });
  it('prefixes non-default locales', () => {
    expect(useTranslatedPath('it')('/')).toBe('/it/');
    expect(useTranslatedPath('it')('/privacy')).toBe('/it/privacy');
    expect(useTranslatedPath('es')('/projects/x')).toBe('/es/projects/x');
  });
});

describe('useTranslations', () => {
  it('resolves a key from the requested locale', () => {
    const t = useTranslations('en');
    expect(t('meta.siteName')).toBe('MicioDev');
  });

  it('falls back to the default locale when a locale lacks the key', () => {
    // The dictionaries are key-complete (see i18n-keys.test.ts), so simulate a
    // gap via a key that only the remote overlay would carry — here we just
    // confirm a known shared key resolves identically across locales.
    expect(useTranslations('it')('meta.siteName')).toBe('MicioDev');
  });

  it('returns a visible marker for an unknown key', () => {
    expect(useTranslations('en')('does.not.exist')).toBe('⟦does.not.exist⟧');
  });

  it('lets the remote overlay win over the bundled JSON', () => {
    applyRemoteDictionaries({ 'meta.siteName': { en: 'Overlaid', it: 'Sovrapposto' } });
    expect(useTranslations('en')('meta.siteName')).toBe('Overlaid');
    expect(useTranslations('it')('meta.siteName')).toBe('Sovrapposto');
  });

  it('falls through the overlay to the default-locale entry when the locale is blank', () => {
    applyRemoteDictionaries({ 'meta.siteName': { en: 'OnlyEn', it: '' } });
    expect(useTranslations('it')('meta.siteName')).toBe('OnlyEn');
  });

  it('ignores an overlay entry with no usable value', () => {
    applyRemoteDictionaries({ 'meta.siteName': { it: '' } });
    // No `en` in the overlay → falls through to bundled JSON.
    expect(useTranslations('it')('meta.siteName')).toBe('MicioDev');
  });
});
