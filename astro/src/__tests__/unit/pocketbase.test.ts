import { describe, it, expect } from 'vitest';
import {
  pb,
  PB_ORIGIN,
  ytVideoId,
  loadTranslations,
  getServices,
  getProjects,
  getProject,
  getCourses,
  getVideos,
  getSkills,
  getCareer,
  getNews,
  getNewsPost,
  getCustomers,
  getCustomer,
  getPages,
  getPage,
  getSocials,
} from '../../lib/pocketbase';
import {
  PROJECTS_SEED,
  SKILLS_SEED,
  CUSTOMERS_SEED,
  PAGES_SEED,
  SOCIALS_SEED,
} from '../../lib/seed-data';

// No PUBLIC_PB_URL in the test env → the PB client is null and every fetch
// helper returns the bundled seed data. That's exactly what we assert here, so
// no test ever hits a real PocketBase instance.

describe('PocketBase client wiring (no PUBLIC_PB_URL)', () => {
  it('exposes a null client and an empty origin', () => {
    expect(pb).toBeNull();
    expect(PB_ORIGIN).toBe('');
  });

  it('loadTranslations resolves without throwing when PB is unset', async () => {
    await expect(loadTranslations()).resolves.toBeUndefined();
  });
});

describe('ytVideoId', () => {
  it('extracts the id from every supported YouTube URL shape', () => {
    expect(ytVideoId('https://www.youtube.com/watch?v=UttHm-Mwqfc')).toBe('UttHm-Mwqfc');
    expect(ytVideoId('https://youtu.be/UttHm-Mwqfc')).toBe('UttHm-Mwqfc');
    expect(ytVideoId('https://www.youtube.com/shorts/UttHm-Mwqfc')).toBe('UttHm-Mwqfc');
    expect(ytVideoId('https://www.youtube.com/embed/UttHm-Mwqfc?rel=0')).toBe('UttHm-Mwqfc');
    expect(ytVideoId('https://www.youtube.com/live/UttHm-Mwqfc')).toBe('UttHm-Mwqfc');
    expect(ytVideoId('https://www.youtube.com/watch?list=PL123&v=UttHm-Mwqfc')).toBe('UttHm-Mwqfc');
  });
  it('returns "" when there is no id', () => {
    expect(ytVideoId('https://example.com/video')).toBe('');
    expect(ytVideoId('')).toBe('');
    // @ts-expect-error — defensive against non-string input
    expect(ytVideoId(undefined)).toBe('');
  });
});

describe('getServices (seed fallback)', () => {
  it('returns the seed services sorted by order with a resolved title/desc', async () => {
    const services = await getServices('en');
    expect(services.length).toBeGreaterThan(0);
    const orders = services.map((s) => (s as unknown as { order: number }).order);
    expect([...orders]).toEqual([...orders].sort((a, b) => a - b));
    for (const s of services) {
      expect(typeof s.title).toBe('string');
      expect(typeof s.desc).toBe('string');
      // The per-locale variants must be stripped off.
      expect((s as unknown as Record<string, unknown>).title_en).toBeUndefined();
      expect((s as unknown as Record<string, unknown>).desc_es).toBeUndefined();
    }
  });

  it('picks the requested locale variant when it is populated', async () => {
    // SERVICES_SEED has Italian copy, so the `it` title differs from `en`.
    const [itFirst] = await getServices('it');
    const [enFirst] = await getServices('en');
    expect(itFirst.title.length).toBeGreaterThan(0);
    expect(itFirst.title).not.toBe(enFirst.title);
  });
});

describe('getProjects / getProject (seed fallback)', () => {
  it('orders client projects (most-recent first) before personal ones', async () => {
    const slugs = (await getProjects('en')).map((p) => p.slug);
    expect(slugs).toEqual([
      'standup-way-platform', // client, ended 2026-02
      'fiberdroid-customer-area', // client, ended 2021-02
      'inspxt', // client, ended 2020-08
      'devboards-io', // personal, ongoing
      'silent-hill-web', // personal, ended 2023-06
    ]);
  });

  it('enriches a customer-linked project with customerName/Slug and a crest', async () => {
    const fiber = (await getProjects('en')).find((p) => p.slug === 'fiberdroid-customer-area')!;
    expect(fiber.customerName).toBe('Fiberdroid');
    expect(fiber.customerSlug).toBe('fiberdroid');
    // No uploaded logos in the seed → crest falls back to initials.
    expect(fiber.crestInitials).toBe('FD');
    expect(fiber.crestUrl).toBe('');
    expect(fiber.imageUrls).toEqual([]);
    expect(fiber.coverUrl).toBe('');
  });

  it('leaves a personal project without a customer', async () => {
    const sh = (await getProjects('en')).find((p) => p.slug === 'silent-hill-web')!;
    expect(sh.customerName).toBe('');
    expect(sh.customerSlug).toBe('');
    expect(sh.crestInitials).toBe('SH');
  });

  it('getProject returns a single record by slug', async () => {
    const p = await getProject('inspxt', 'en');
    expect(p?.title).toBe('INspxt — inspections management platform');
    expect(p?.client).toBe('TC2 Group');
  });

  it('getProject falls back to the English title when the locale variant is blank', async () => {
    // Seed projects have empty `title_it`/`title_es` → `en` is used.
    const en = await getProject('inspxt', 'en');
    const it = await getProject('inspxt', 'it');
    expect(it?.title).toBe(en?.title);
  });

  it('getProject returns null for an unknown slug', async () => {
    expect(await getProject('does-not-exist', 'en')).toBeNull();
  });
});

describe('getCourses (seed fallback)', () => {
  it('returns courses sorted by order with resolved title', async () => {
    const courses = await getCourses('en');
    expect(courses.length).toBeGreaterThan(0);
    const orders = courses.map((c) => (c as unknown as { order: number }).order);
    expect([...orders]).toEqual([...orders].sort((a, b) => a - b));
    for (const c of courses) expect(typeof c.title).toBe('string');
  });
});

describe('getVideos (seed fallback)', () => {
  it('derives videoId and a thumbnail URL for each video', async () => {
    const videos = await getVideos();
    expect(videos.length).toBeGreaterThan(0);
    for (const v of videos) {
      expect(v.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(v.thumbUrl).toBe(`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`);
    }
  });
});

describe('getSkills (seed fallback)', () => {
  it('returns the seed skills', async () => {
    const skills = await getSkills();
    expect(skills).toEqual(SKILLS_SEED);
  });
});

describe('getCareer (seed fallback)', () => {
  it('returns career milestones sorted by order with a resolved body', async () => {
    const career = await getCareer('en');
    expect(career.length).toBeGreaterThan(0);
    for (const item of career) {
      expect(typeof item.body).toBe('string');
      expect(Array.isArray(item.tech)).toBe(true);
    }
  });
});

describe('getNews (empty seed)', () => {
  it('returns an empty list and null for any slug', async () => {
    expect(await getNews('en')).toEqual([]);
    expect(await getNewsPost('anything', 'en')).toBeNull();
  });
});

describe('getCustomers / getCustomer (seed fallback)', () => {
  it('returns featured customers first', async () => {
    const customers = await getCustomers('en');
    expect(customers.length).toBe(CUSTOMERS_SEED.length);
    const featuredFlags = customers.map((c) => c.featured);
    // All `true`s must come before any `false`.
    const firstFalse = featuredFlags.indexOf(false);
    if (firstFalse !== -1) {
      expect(featuredFlags.slice(firstFalse).every((f) => f === false)).toBe(true);
    }
  });

  it('getCustomer returns the customer plus its linked projects', async () => {
    const c = await getCustomer('fiberdroid', 'en');
    expect(c?.name).toBe('Fiberdroid');
    expect(c?.projects.map((p) => p.slug)).toContain('fiberdroid-customer-area');
  });

  it('getCustomer returns null for an unknown slug', async () => {
    expect(await getCustomer('nope', 'en')).toBeNull();
  });
});

describe('getPages / getPage (seed fallback)', () => {
  it('returns only published pages, sorted by order', async () => {
    const pages = await getPages('en');
    const publishedSeed = PAGES_SEED.filter((p) => p.published);
    expect(pages.map((p) => p.slug)).toEqual(
      [...publishedSeed].sort((a, b) => a.order - b.order).map((p) => p.slug),
    );
    for (const p of pages) {
      expect(typeof p.title).toBe('string');
      expect(typeof p.body).toBe('string');
    }
  });

  it('getPage resolves a known slug and rejects an unknown one', async () => {
    expect((await getPage('privacy', 'en'))?.title).toBe('Privacy Policy');
    expect(await getPage('not-a-page', 'en')).toBeNull();
  });
});

describe('getSocials (seed fallback)', () => {
  it('returns the seed socials sorted by order', async () => {
    const socials = await getSocials();
    expect(socials.map((s) => s.order)).toEqual(
      [...SOCIALS_SEED].sort((a, b) => a.order - b.order).map((s) => s.order),
    );
  });
});

describe('PROJECTS_SEED sanity', () => {
  it('every project has a unique slug', () => {
    const slugs = PROJECTS_SEED.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
