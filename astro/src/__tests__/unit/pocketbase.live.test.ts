/**
 * Exercises the *live* PocketBase code paths in src/lib/pocketbase.ts (the
 * `if (pb) { try … } catch …` branches) without touching a real instance: the
 * `pocketbase` package is replaced with an in-memory fake, and PUBLIC_PB_URL is
 * stubbed so the module builds a (fake) client. Covers happy paths, the
 * error → seed-data fallback, and the file-URL helpers.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// Shared, hoisted so the (hoisted) vi.mock factory can reference it.
const h = vi.hoisted(() => {
  const store: Record<string, Record<string, unknown>[]> = {};
  const failing = new Set<string>();
  return { store, failing };
});

vi.mock('pocketbase', () => {
  function matches(filter: unknown, rec: Record<string, unknown>): boolean {
    if (filter == null) return true;
    if (typeof filter === 'string') {
      if (filter.includes('published = true')) return rec.published === true;
      return true;
    }
    const f = filter as Record<string, unknown>;
    if ('slug' in f) {
      if (f.__publishedTrue && rec.published !== true) return false;
      return rec.slug === f.slug;
    }
    if ('id' in f) return rec.customer === f.id;
    return true;
  }
  class FakeCollection {
    constructor(private name: string) {}
    async getFullList(opts: { filter?: unknown } = {}) {
      if (h.failing.has(this.name)) throw new Error(`[fake] ${this.name} unavailable`);
      const rows = (h.store[this.name] ?? []).filter((r) => matches(opts.filter, r));
      // The fake doesn't expand relations; mimic PB returning a shallow copy.
      return rows.map((r) => ({ ...r }));
    }
    async getFirstListItem(filter: unknown) {
      if (h.failing.has(this.name)) throw new Error(`[fake] ${this.name} unavailable`);
      const row = (h.store[this.name] ?? []).find((r) => matches(filter, r));
      if (!row) throw new Error('[fake] not found');
      return { ...row };
    }
  }
  class FakePocketBase {
    files = {
      getURL: (rec: { id: string; collectionId: string }, filename: string) =>
        `http://pb.test/api/files/${rec.collectionId}/${rec.id}/${filename}`,
    };
    constructor(public baseURL: string) {}
    collection(name: string) {
      return new FakeCollection(name);
    }
    // Real SDK returns a bound filter string; the fake returns the params (plus
    // a flag for the `published = true` clause) so the collection stubs above
    // can match on them.
    filter(template: string, params?: Record<string, unknown>) {
      if (!params) return template;
      return { ...params, ...(template.includes('published = true') ? { __publishedTrue: true } : {}) };
    }
  }
  return { default: FakePocketBase };
});

vi.stubEnv('PUBLIC_PB_URL', 'http://pb.test:8090');

// Import AFTER the env stub + mock so the module wires up the fake client.
const pbmod = await import('../../lib/pocketbase');
const {
  pb,
  PB_ORIGIN,
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
} = pbmod;
const { applyRemoteDictionaries } = await import('../../i18n/utils');

function seedFakeData() {
  h.store.translations = [
    { key: 'meta.siteName', en: 'RemoteName', it: 'NomeRemoto', es: 'NombreRemoto' },
  ];
  h.store.services = [
    { id: 's1', collectionId: 'svc', order: 2, title_en: 'B', title_it: 'B-it', title_es: '', desc_en: 'bd', desc_it: '', desc_es: '' },
    { id: 's2', collectionId: 'svc', order: 1, title_en: 'A', title_it: '', title_es: '', desc_en: 'ad', desc_it: '', desc_es: '' },
  ];
  h.store.customers = [
    {
      id: 'cust-acme', collectionId: 'cus', slug: 'acme', name: 'Acme', sector: 'Widgets', url: 'https://acme.test',
      logo: 'acme-logo.webp', images: ['a1.webp', 'a2.webp'], primary_image: 'a2.webp', featured: true, order: 1,
      started: '2020-01-01', ended: '2021-01-01',
      description_en: 'Acme desc', description_it: '', description_es: '',
      testimonial_en: 'Great!', testimonial_it: '', testimonial_es: '', testimonial_author: 'Wile E.',
    },
    {
      id: 'cust-beta', collectionId: 'cus', slug: 'beta', name: 'Beta Co', sector: 'Things', url: 'https://beta.test',
      logo: '', images: [], primary_image: '', featured: false, order: 2,
      started: '', ended: '',
      description_en: 'Beta desc', description_it: '', description_es: '',
      testimonial_en: '', testimonial_it: '', testimonial_es: '', testimonial_author: '',
    },
  ];
  h.store.projects = [
    {
      id: 'p-acme', collectionId: 'prj', slug: 'acme-portal', idx: '01', client: 'Acme', clientInitials: '',
      period: '2020 — 2021', started: '2020-02-01', ended: '2020-12-01', featured: true, order: 1, customer: 'cust-acme',
      title_en: 'Acme portal', title_it: '', title_es: '', desc_en: 'A portal for Acme.', desc_it: '', desc_es: '',
      stack: ['Laravel'], kpis: [], live_url: '', repo_url: '', logo: 'proj-logo.webp', images: ['s1.png'], primary_image: '',
    },
    {
      id: 'p-personal', collectionId: 'prj', slug: 'my-thing', idx: '02', client: 'Personal project', clientInitials: 'MT',
      period: '2022 — present', started: '2022-01-01', ended: '', featured: false, order: 2, customer: '',
      title_en: 'My thing', title_it: '', title_es: '', desc_en: 'A personal thing.', desc_it: '', desc_es: '',
      stack: [], kpis: [], live_url: '', repo_url: '', logo: '', images: [], primary_image: '',
    },
  ];
  h.store.courses = [
    { id: 'c1', collectionId: 'crs', order: 2, slug: 'b', platform: 'udemy', featured: false, title_en: 'CourseB', title_it: '', title_es: '', desc_en: '', desc_it: '', desc_es: '' },
    { id: 'c2', collectionId: 'crs', order: 1, slug: 'a', platform: 'youtube', featured: true, title_en: 'CourseA', title_it: '', title_es: '', desc_en: '', desc_it: '', desc_es: '' },
  ];
  h.store.videos = [
    { id: 'v1', collectionId: 'vid', order: 2, url: 'https://youtu.be/UttHm-Mwqfc', title: 'Vid2' },
    { id: 'v2', collectionId: 'vid', order: 1, url: 'not-a-youtube-url', title: 'Vid1' },
  ];
  h.store.skills = [
    { id: 'sk1', collectionId: 'skl', group: 'languages', order: 1, name: 'PHP', weight: 'primary' },
  ];
  h.store.career = [
    { id: 'cr1', collectionId: 'car', order: 1, period: '2018 — now', company: 'Self', body_en: 'Freelancing.', body_it: '', body_es: '', tech: ['Laravel'] },
    { id: 'cr2', collectionId: 'car', order: 2, period: '2015 — 2018', company: 'Agency', body_en: 'Agency work.', body_it: '', body_es: '', tech: 'not-an-array' },
  ];
  h.store.news = [
    { id: 'n1', collectionId: 'nws', slug: 'hello', date: '2026-01-01', cover: 'cover.webp', tags: ['x'], order: 1, title_en: 'Hello', title_it: '', title_es: '', excerpt_en: 'Hi', excerpt_it: '', excerpt_es: '', body_en: 'Body', body_it: '', body_es: '' },
  ];
  h.store.pages = [
    { id: 'pg1', collectionId: 'pgs', slug: 'privacy', order: 1, published: true, title_en: 'Privacy', title_it: '', title_es: '', body_en: '<p>x</p>', body_it: '', body_es: '' },
    { id: 'pg2', collectionId: 'pgs', slug: 'draft', order: 2, published: false, title_en: 'Draft', title_it: '', title_es: '', body_en: '<p>d</p>', body_it: '', body_es: '' },
  ];
  h.store.socials = [
    { id: 'so1', collectionId: 'soc', order: 2, icon: 'github', url: 'https://github.com/x', label: 'GitHub' },
    { id: 'so2', collectionId: 'soc', order: 1, icon: 'youtube', url: 'https://youtube.com/x', label: 'YouTube' },
  ];
}

beforeEach(() => {
  for (const k of Object.keys(h.store)) delete h.store[k];
  h.failing.clear();
  seedFakeData();
  applyRemoteDictionaries({});
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('module wiring with PUBLIC_PB_URL set', () => {
  it('builds a (fake) client and resolves the origin', () => {
    expect(pb).not.toBeNull();
    expect(PB_ORIGIN).toBe('http://pb.test:8090');
  });
});

describe('loadTranslations (live)', () => {
  // `loadTranslations` carries a module-level "last loaded at" timestamp, so
  // each case starts from a fresh module graph to control the 30s TTL cleanly.
  async function freshModules() {
    vi.resetModules();
    vi.stubEnv('PUBLIC_PB_URL', 'http://pb.test:8090');
    const pbm = await import('../../lib/pocketbase');
    const i18n = await import('../../i18n/utils');
    i18n.applyRemoteDictionaries({});
    return { ...pbm, ...i18n };
  }

  it('overlays the remote translations onto the bundled JSON', async () => {
    const m = await freshModules();
    await m.loadTranslations();
    expect(m.useTranslations('en')('meta.siteName')).toBe('RemoteName');
    expect(m.useTranslations('it')('meta.siteName')).toBe('NomeRemoto');
  });

  it('is cached within the TTL window (a second call does not re-overlay)', async () => {
    const m = await freshModules();
    await m.loadTranslations();
    h.store.translations = [{ key: 'meta.siteName', en: 'Changed' }];
    await m.loadTranslations();
    expect(m.useTranslations('en')('meta.siteName')).toBe('RemoteName');
  });

  it('keeps the previous overlay (bundled JSON) when the fetch fails', async () => {
    h.failing.add('translations');
    const m = await freshModules();
    await m.loadTranslations();
    expect(m.useTranslations('en')('meta.siteName')).toBe('MicioDev');
  });
});

describe('getServices / getCourses (live)', () => {
  it('returns rows sorted by order with the requested locale resolved', async () => {
    const services = await getServices('it');
    expect(services.map((s) => s.title)).toEqual(['A', 'B-it']); // s2 (order 1) then s1; it=B-it, en-fallback for A
    expect((services[0] as Record<string, unknown>).title_en).toBeUndefined();
    const courses = await getCourses('en');
    expect(courses.map((c) => c.title)).toEqual(['CourseA', 'CourseB']);
  });

  it('falls back to seed data when the collection errors', async () => {
    h.failing.add('services');
    const services = await getServices('en');
    expect(services.length).toBeGreaterThan(0);
    // Seed titles, not the fake ones.
    expect(services.some((s) => s.title === 'A' || s.title === 'B')).toBe(false);
  });
});

describe('getProjects / getProject (live)', () => {
  it('orders client projects before personal ones and enriches file/customer fields', async () => {
    const projects = await getProjects('en');
    expect(projects.map((p) => p.slug)).toEqual(['acme-portal', 'my-thing']);
    const acme = projects[0];
    expect(acme.imageUrls).toEqual(['http://pb.test/api/files/prj/p-acme/s1.png']);
    expect(acme.coverUrl).toBe('http://pb.test/api/files/prj/p-acme/s1.png');
    // No expand in the fake → falls back to the bundled CUSTOMERS_SEED lookup,
    // which doesn't contain 'cust-acme', so customer fields stay blank…
    expect(acme.customerName).toBe('');
    // …but the project's own logo still wins for the crest.
    expect(acme.crestUrl).toBe('http://pb.test/api/files/prj/p-acme/proj-logo.webp');
    // No clientInitials, no expanded customer → initials fall back off `client`.
    expect(acme.crestInitials).toBe('A');

    const personal = projects[1];
    expect(personal.crestInitials).toBe('MT');
    expect(personal.imageUrls).toEqual([]);
  });

  it('getProject resolves by slug and returns null for an unknown one', async () => {
    expect((await getProject('acme-portal', 'en'))?.title).toBe('Acme portal');
    expect(await getProject('nope', 'en')).toBeNull();
  });

  it('falls back to seed data when projects error', async () => {
    h.failing.add('projects');
    const projects = await getProjects('en');
    expect(projects.find((p) => p.slug === 'acme-portal')).toBeUndefined();
    expect(projects.length).toBeGreaterThan(0);
  });
});

describe('getVideos / getSkills / getCareer (live)', () => {
  it('maps videos with derived ids (empty for non-YouTube urls), sorted by order', async () => {
    const videos = await getVideos();
    expect(videos.map((v) => v.title)).toEqual(['Vid1', 'Vid2']);
    expect(videos[0].videoId).toBe('');
    expect(videos[0].thumbUrl).toBe('');
    expect(videos[1].videoId).toBe('UttHm-Mwqfc');
  });

  it('returns the live skills', async () => {
    const skills = await getSkills();
    expect(skills.map((s) => s.name)).toEqual(['PHP']);
  });

  it('maps career items, defaulting a non-array tech field to []', async () => {
    const career = await getCareer('en');
    expect(career.map((c) => c.company)).toEqual(['Self', 'Agency']);
    expect(career[0].tech).toEqual(['Laravel']);
    expect(career[1].tech).toEqual([]);
  });

  it('falls back to seed data on error', async () => {
    h.failing.add('videos');
    h.failing.add('skills');
    h.failing.add('career');
    expect((await getVideos()).length).toBeGreaterThan(0);
    expect((await getSkills()).length).toBeGreaterThan(0);
    expect((await getCareer('en')).length).toBeGreaterThan(0);
  });
});

describe('getNews / getNewsPost (live)', () => {
  it('maps news items and their cover URL', async () => {
    const news = await getNews('en');
    expect(news[0].title).toBe('Hello');
    expect(news[0].coverUrl).toBe('http://pb.test/api/files/nws/n1/cover.webp');
    expect((await getNewsPost('hello', 'en'))?.title).toBe('Hello');
    expect(await getNewsPost('missing', 'en')).toBeNull();
  });
});

describe('getCustomers / getCustomer (live)', () => {
  it('returns customers featured-first with derived image URLs', async () => {
    const customers = await getCustomers('en');
    expect(customers.map((c) => c.slug)).toEqual(['acme', 'beta']);
    const acme = customers[0];
    expect(acme.logoUrl).toBe('http://pb.test/api/files/cus/cust-acme/acme-logo.webp');
    // primary_image was 'a2.webp' → it leads the imageUrls list.
    expect(acme.imageUrls[0]).toBe('http://pb.test/api/files/cus/cust-acme/a2.webp');
    expect(acme.primaryImageUrl).toBe('http://pb.test/api/files/cus/cust-acme/a2.webp');
    expect(acme.testimonialAuthor).toBe('Wile E.');
  });

  it('getCustomer attaches the linked projects (recency-ordered)', async () => {
    const c = await getCustomer('acme', 'en');
    expect(c?.name).toBe('Acme');
    expect(c?.projects.map((p) => p.slug)).toEqual(['acme-portal']);
    expect(c?.projects[0].title).toBe('Acme portal');
  });

  it('getCustomer returns null for an unknown slug', async () => {
    expect(await getCustomer('ghost', 'en')).toBeNull();
  });

  it('getCustomer tolerates the projects sub-query failing', async () => {
    h.failing.add('projects');
    const c = await getCustomer('acme', 'en');
    expect(c?.name).toBe('Acme');
    expect(c?.projects).toEqual([]);
  });

  it('falls back to seed data when customers error', async () => {
    h.failing.add('customers');
    const customers = await getCustomers('en');
    expect(customers.find((c) => c.slug === 'acme')).toBeUndefined();
    expect(customers.length).toBeGreaterThan(0);
  });
});

describe('getPages / getPage (live)', () => {
  it('returns only published pages', async () => {
    const pages = await getPages('en');
    expect(pages.map((p) => p.slug)).toEqual(['privacy']);
    expect((await getPage('privacy', 'en'))?.title).toBe('Privacy');
    expect(await getPage('draft', 'en')).toBeNull();
    expect(await getPage('nope', 'en')).toBeNull();
  });

  it('falls back to seed data when pages error', async () => {
    h.failing.add('pages');
    const pages = await getPages('en');
    expect(pages.length).toBeGreaterThan(0);
  });
});

describe('getSocials (live)', () => {
  it('returns socials sorted by order', async () => {
    const socials = await getSocials();
    expect(socials.map((s) => s.label)).toEqual(['YouTube', 'GitHub']);
  });

  it('falls back to seed data on error', async () => {
    h.failing.add('socials');
    expect((await getSocials()).length).toBeGreaterThan(0);
  });
});
