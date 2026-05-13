import { describe, it, expect, beforeEach, vi } from 'vitest';

// `astro:middleware` is a virtual module — aliased to a tiny identity-stub in
// vitest.config.ts so this file can be exercised outside of an Astro build.

// `loadTranslations` is the only thing the middleware imports from
// pocketbase.ts. We don't care which branch (live PB / no PB) it takes — only
// that the middleware tolerates both a resolved and a rejected call.
const loadTranslationsMock = vi.fn();
vi.mock('../../lib/pocketbase', () => ({
  loadTranslations: () => loadTranslationsMock(),
}));

import { onRequest } from '../../middleware';

type Cookies = {
  get: (k: string) => { value: string } | undefined;
  set: (k: string, v: string, o: Record<string, unknown>) => void;
};

interface FakeContext {
  url: URL;
  cookies: Cookies;
  request: Request;
  redirect: ReturnType<typeof vi.fn>;
}

function makeContext(
  path: string,
  opts: {
    cookie?: string;
    acceptLanguage?: string;
  } = {},
): { ctx: FakeContext; cookieStore: Map<string, string>; cookieSets: unknown[] } {
  const cookieStore = new Map<string, string>();
  if (opts.cookie) cookieStore.set('miciodev-locale', opts.cookie);
  const cookieSets: unknown[] = [];
  const cookies: Cookies = {
    get: (k) => {
      const v = cookieStore.get(k);
      return v === undefined ? undefined : { value: v };
    },
    set: (k, v, o) => {
      cookieStore.set(k, v);
      cookieSets.push({ k, v, o });
    },
  };
  const headers = new Headers();
  if (opts.acceptLanguage) headers.set('accept-language', opts.acceptLanguage);
  const ctx: FakeContext = {
    url: new URL(`https://example.com${path}`),
    cookies,
    request: new Request(`https://example.com${path}`, { headers }),
    redirect: vi.fn((to: string, code: number) => ({ to, code, __redirect: true })),
  };
  return { ctx, cookieStore, cookieSets };
}

beforeEach(() => {
  loadTranslationsMock.mockReset();
  loadTranslationsMock.mockResolvedValue(undefined);
});

describe('middleware — translations warm-up', () => {
  it('awaits loadTranslations before calling next()', async () => {
    const order: string[] = [];
    loadTranslationsMock.mockImplementation(async () => {
      order.push('load');
    });
    const next = vi.fn(async () => {
      order.push('next');
      return new Response('ok');
    });
    const { ctx } = makeContext('/it/projects/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(order).toEqual(['load', 'next']);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('swallows a thrown loadTranslations and still serves the request', async () => {
    loadTranslationsMock.mockRejectedValue(new Error('PB down'));
    const next = vi.fn(async () => new Response('ok'));
    const { ctx } = makeContext('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(onRequest(ctx as any, next)).resolves.toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('middleware — auto-locale redirect on /', () => {
  it('redirects to /it/ when the cookie picks Italian', async () => {
    const next = vi.fn();
    const { ctx } = makeContext('/', { cookie: 'it' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/it/', 302);
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to /es/ when only Accept-Language picks Spanish', async () => {
    const next = vi.fn();
    const { ctx } = makeContext('/', { acceptLanguage: 'es-AR,es;q=0.9,en;q=0.5' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/es/', 302);
    expect(next).not.toHaveBeenCalled();
  });

  it('prefers cookie over Accept-Language', async () => {
    const next = vi.fn();
    const { ctx } = makeContext('/', { cookie: 'it', acceptLanguage: 'es' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/it/', 302);
  });

  it('does not redirect when the preferred locale is the default (en)', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx } = makeContext('/', { acceptLanguage: 'en-US,en;q=0.9' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('falls back to next() when neither cookie nor Accept-Language is recognised', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx } = makeContext('/', {
      cookie: 'xx',
      acceptLanguage: 'fr-FR,fr;q=0.9,de;q=0.5',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('only triggers the redirect on the bare root, not on /projects/', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx } = makeContext('/projects/', { cookie: 'it' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

describe('middleware — locale cookie persistence', () => {
  it('writes the cookie when the visitor lands on a locale that differs from the stored one', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx, cookieSets, cookieStore } = makeContext('/it/projects/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(cookieSets).toHaveLength(1);
    const set = cookieSets[0] as { k: string; v: string; o: Record<string, unknown> };
    expect(set.k).toBe('miciodev-locale');
    expect(set.v).toBe('it');
    expect(set.o.path).toBe('/');
    expect(set.o.sameSite).toBe('lax');
    expect(set.o.maxAge).toBe(60 * 60 * 24 * 365);
    expect(cookieStore.get('miciodev-locale')).toBe('it');
  });

  it('does NOT rewrite the cookie when it already matches the current locale', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx, cookieSets } = makeContext('/it/projects/', { cookie: 'it' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(cookieSets).toHaveLength(0);
  });

  it('writes a cookie of "en" for a neutral (default-locale) path', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx, cookieSets } = makeContext('/projects/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(cookieSets).toHaveLength(1);
    expect((cookieSets[0] as { v: string }).v).toBe('en');
  });
});

describe('middleware — Accept-Language parser edge cases', () => {
  it('handles missing/empty Accept-Language without picking anything', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx } = makeContext('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('ignores junk first entries and continues down the q-ordered list', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const { ctx } = makeContext('/', { acceptLanguage: 'zh-Hant;q=1, it-IT;q=0.8' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onRequest(ctx as any, next);
    expect(ctx.redirect).toHaveBeenCalledWith('/it/', 302);
  });
});
