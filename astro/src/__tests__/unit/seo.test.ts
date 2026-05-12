import { describe, it, expect, afterEach } from 'vitest';
import { siteUrl, isStagingHost, localizedPath, xmlEscape, LOCALES } from '../../lib/seo';

const ORIGINAL_SITE_URL = process.env.PUBLIC_SITE_URL;
afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) delete process.env.PUBLIC_SITE_URL;
  else process.env.PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
});

describe('siteUrl', () => {
  it('prefers PUBLIC_SITE_URL and strips the trailing slash', () => {
    process.env.PUBLIC_SITE_URL = 'https://miciodev.com/';
    expect(siteUrl(new URL('https://astro-site.example'), 'https://req.example/x')).toBe(
      'https://miciodev.com',
    );
  });

  it('falls back to Astro.site when the env var is unset', () => {
    delete process.env.PUBLIC_SITE_URL;
    expect(siteUrl(new URL('https://astro-site.example/'), 'https://req.example/x')).toBe(
      'https://astro-site.example',
    );
  });

  it('falls back to the request origin when nothing else is set', () => {
    delete process.env.PUBLIC_SITE_URL;
    expect(siteUrl(undefined, 'https://req.example/some/path?q=1')).toBe('https://req.example');
  });
});

describe('isStagingHost', () => {
  it('is true for stage.* hostnames', () => {
    expect(isStagingHost('https://stage.micio86dev.it')).toBe(true);
  });
  it('is false for the production host and for garbage input', () => {
    expect(isStagingHost('https://micio86dev.it')).toBe(false);
    expect(isStagingHost('not a url')).toBe(false);
  });
});

describe('localizedPath', () => {
  it('returns the path as-is for English', () => {
    expect(localizedPath('/projects', 'en')).toBe('/projects');
    expect(localizedPath('/', 'en')).toBe('/');
    expect(localizedPath('projects', 'en')).toBe('/projects');
  });
  it('prefixes the locale segment for it/es', () => {
    expect(localizedPath('/projects', 'it')).toBe('/it/projects');
    expect(localizedPath('/', 'it')).toBe('/it/');
    expect(localizedPath('/', 'es')).toBe('/es/');
  });
});

describe('xmlEscape', () => {
  it('escapes the five XML metacharacters', () => {
    expect(xmlEscape(`Tom & Jerry's <"quote">`)).toBe(
      'Tom &amp; Jerry&apos;s &lt;&quot;quote&quot;&gt;',
    );
  });
  it('leaves plain text untouched', () => {
    expect(xmlEscape('plain text 123')).toBe('plain text 123');
  });
});

describe('LOCALES re-export', () => {
  it('is the canonical locale list', () => {
    expect([...LOCALES]).toEqual(['en', 'it', 'es']);
  });
});
