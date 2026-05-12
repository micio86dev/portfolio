/**
 * PocketBase client + content fetch helpers (server-only — do not import from
 * client components).
 *
 * All page content lives in PocketBase:
 *   - UI strings        → `translations` (key / en / it / es), loaded once per
 *                          request by `loadTranslations()` (called from
 *                          src/middleware.ts) and overlaid on the bundled JSON.
 *   - Services / §02    → `services`        → getServices(locale)
 *   - Projects / §03    → `projects`        → getProjects(locale)
 *   - Skills / §04      → `skills`          → getSkills()
 *   - Courses           → `courses`         → getCourses(locale)
 *   - Career / About    → `career`          → getCareer(locale)
 *   - News              → `news`            → getNews(locale)
 *   - Customers         → `customers`       → getCustomers(locale)
 *
 * Pages/components call these from their Astro frontmatter. With `output:
 * 'server'` those run on every request, so content is always fresh — no
 * redeploy needed. If `PUBLIC_PB_URL` is unset or the instance is unreachable,
 * we fall back to the bundled seed data so the site still renders.
 *
 * `PUBLIC_PB_URL` is read at RUNTIME: `process.env.PUBLIC_PB_URL` first (set by
 * the container's `environment:` block in prod), then `import.meta.env` as a
 * fallback for `astro dev` reading a local `.env`.
 */

import PocketBase from 'pocketbase';
import type { Locale } from '../i18n/utils';
import { applyRemoteDictionaries } from '../i18n/utils';
import {
  PROJECTS_SEED,
  SERVICES_SEED,
  SKILLS_SEED,
  COURSES_SEED,
  VIDEOS_SEED,
  CAREER_SEED,
  NEWS_SEED,
  CUSTOMERS_SEED,
  PAGES_SEED,
  SOCIALS_SEED,
  type ProjectRecord,
  type ServiceRecord,
  type SkillRecord,
  type CourseRecord,
  type VideoRecord,
  type VideoItem,
  type CareerRecord,
  type CareerItem,
  type NewsRecord,
  type NewsItem,
  type CustomerRecord,
  type CustomerItem,
  type CustomerProjectRef,
  type CustomerDetail,
  type PageRecord,
  type PageItem,
  type SocialRecord,
  type Localized,
} from './seed-data';

const PB_URL =
  (typeof process !== 'undefined' ? process.env.PUBLIC_PB_URL : undefined) ||
  (import.meta.env.PUBLIC_PB_URL as string | undefined);

/** Origin of the PocketBase instance (e.g. `https://pb.micio86dev.it`), or '' when
 *  unset. The page CSP whitelists this for `img-src` (file URLs minted by `fileUrl()`)
 *  and `connect-src` (the contact-form POST in ContactForm.vue). */
export const PB_ORIGIN = (() => {
  try {
    return PB_URL ? new URL(PB_URL).origin : '';
  } catch {
    return '';
  }
})();

/** Singleton client. Server-only; `null` when PUBLIC_PB_URL is not set. */
export const pb: PocketBase | null = PB_URL ? new PocketBase(PB_URL) : null;

function localize<T extends ServiceRecord | ProjectRecord | CourseRecord>(
  record: T,
  locale: Locale,
): Localized<T> {
  const rest = { ...(record as unknown as Record<string, unknown>) };
  const title = rest[`title_${locale}`] || rest['title_en'];
  const desc = rest[`desc_${locale}`] || rest['desc_en'];
  // Drop every per-locale variant; expose only the resolved title/desc.
  for (const l of ['en', 'it', 'es']) {
    delete rest[`title_${l}`];
    delete rest[`desc_${l}`];
  }
  return { ...rest, title: String(title ?? ''), desc: String(desc ?? '') } as unknown as Localized<T>;
}

/** Pick `field_<locale>` with a fall-through to `field_en` (then ''). */
function pick(record: Record<string, unknown>, field: string, locale: Locale): string {
  const v = record[`${field}_${locale}`];
  if (typeof v === 'string' && v !== '') return v;
  const en = record[`${field}_en`];
  return typeof en === 'string' ? en : '';
}

/** Featured-first ordering for a grid (featured items up top, then by `order`). */
function featuredFirst<T extends { featured: boolean; order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.order - b.order;
  });
}

/**
 * Homepage project ordering: personal projects (no/empty `customer`) come
 * AFTER all client ones; within each group, sorted most-recent-first by the
 * recency key = `ended` if non-empty, else `started` (an empty `ended` —
 * "ongoing" — counts as the most recent). `order` is the final tiebreaker.
 *
 * Distinct from `featuredFirst` (still used for `customers` and elsewhere) —
 * don't conflate the two.
 */
function byRecencyPersonalLast<
  T extends { customer?: string; started?: string; ended?: string; order: number },
>(items: T[]): T[] {
  const isPersonal = (x: T) => !x.customer;
  // Recency key: `ended` if set; otherwise (ongoing) a '￿'-prefixed string
  // so it sorts above every real `ended` date, sub-ordered by `started`.
  const recencyKey = (x: T) => (x.ended ? x.ended : `￿${x.started ?? ''}`);
  return [...items].sort((a, b) => {
    if (isPersonal(a) !== isPersonal(b)) return isPersonal(a) ? 1 : -1;
    const ka = recencyKey(a);
    const kb = recencyKey(b);
    if (ka !== kb) return ka < kb ? 1 : -1; // DESC — most recent first
    return a.order - b.order;
  });
}

// ── UI strings: PocketBase `translations` → i18n overlay ───────────────

interface TranslationRow {
  key: string;
  en: string;
  it?: string;
  es?: string;
}

let translationsLoadedAt = 0;
const TRANSLATIONS_TTL_MS = 30_000;

/**
 * Fetch the `translations` collection and push it into the i18n overlay
 * (`applyRemoteDictionaries`). Called from the request middleware before any
 * component renders. Cached for `TRANSLATIONS_TTL_MS` so a burst of requests
 * doesn't hammer PocketBase; on failure the previous overlay (or the bundled
 * JSON fallback) stays in effect.
 */
export async function loadTranslations(): Promise<void> {
  if (!pb) return;
  if (Date.now() - translationsLoadedAt < TRANSLATIONS_TTL_MS) return;
  try {
    const rows = await pb.collection('translations').getFullList<TranslationRow>({
      fields: 'key,en,it,es',
      requestKey: null,
    });
    const map: Record<string, { en?: string; it?: string; es?: string }> = {};
    for (const r of rows) map[r.key] = { en: r.en, it: r.it, es: r.es };
    applyRemoteDictionaries(map);
    translationsLoadedAt = Date.now();
  } catch (err) {
    console.warn(
      '[pocketbase] loadTranslations failed — using bundled i18n JSON:',
      (err as Error)?.message,
    );
  }
}

// ── Services (§02) ─────────────────────────────────────────────────────

export async function getServices(locale: Locale): Promise<Localized<ServiceRecord>[]> {
  if (pb) {
    try {
      const items = await pb.collection('services').getFullList<ServiceRecord>({
        sort: '+order',
        requestKey: null,
      });
      return [...items].sort((a, b) => a.order - b.order).map((r) => localize(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getServices failed — using seed data:', (err as Error)?.message);
    }
  }
  return [...SERVICES_SEED].sort((a, b) => a.order - b.order).map((r) => localize(r, locale));
}

// ── Projects (§03) ─────────────────────────────────────────────────────

export async function getProjects(locale: Locale): Promise<Localized<ProjectRecord>[]> {
  if (pb) {
    try {
      const items = await pb.collection('projects').getFullList<ProjectRecord>({
        sort: '+order',
        expand: 'customer',
        requestKey: null,
      });
      return byRecencyPersonalLast(items).map((r) => enrichProject(localize(r, locale), r));
    } catch (err) {
      console.warn('[pocketbase] getProjects failed — using seed data:', (err as Error)?.message);
    }
  }
  return byRecencyPersonalLast(PROJECTS_SEED).map((r) => enrichProject(localize(r, locale), r));
}

export async function getProject(
  slug: string,
  locale: Locale,
): Promise<Localized<ProjectRecord> | null> {
  if (pb) {
    try {
      const r = await pb
        .collection('projects')
        .getFirstListItem<ProjectRecord>(pb.filter('slug = {:slug}', { slug }), {
          expand: 'customer',
          requestKey: null,
        });
      return enrichProject(localize(r, locale), r);
    } catch {
      return null;
    }
  }
  const seed = PROJECTS_SEED.find((r) => r.slug === slug);
  return seed ? enrichProject(localize(seed, locale), seed) : null;
}

// ── Courses ────────────────────────────────────────────────────────────

export async function getCourses(locale: Locale): Promise<Localized<CourseRecord>[]> {
  if (pb) {
    try {
      const items = await pb.collection('courses').getFullList<CourseRecord>({
        sort: '+order',
        requestKey: null,
      });
      return [...items].sort((a, b) => a.order - b.order).map((r) => localize(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getCourses failed — using seed data:', (err as Error)?.message);
    }
  }
  return [...COURSES_SEED].sort((a, b) => a.order - b.order).map((r) => localize(r, locale));
}

// ── Videos (§ 04c — the "Videos" box) ──────────────────────────────────

/** Extract the 11-char YouTube id from a watch / youtu.be / shorts / embed /
 *  live URL. Returns '' if it can't be found. */
export function ytVideoId(url: string): string {
  const m = String(url ?? '').match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : '';
}

function toVideoItem(r: VideoRecord): VideoItem {
  const videoId = ytVideoId(r.url);
  return {
    id: r.id,
    url: r.url,
    title: r.title,
    videoId,
    // hqdefault is always available; the section crops the 4:3 frame to 16:9.
    thumbUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '',
  };
}

export async function getVideos(): Promise<VideoItem[]> {
  if (pb) {
    try {
      const items = await pb.collection('videos').getFullList<VideoRecord>({
        sort: '+order',
        requestKey: null,
      });
      return [...items].sort((a, b) => a.order - b.order).map(toVideoItem);
    } catch (err) {
      console.warn('[pocketbase] getVideos failed — using seed data:', (err as Error)?.message);
    }
  }
  return [...VIDEOS_SEED].sort((a, b) => a.order - b.order).map(toVideoItem);
}

// ── Skills (§04) ───────────────────────────────────────────────────────

export async function getSkills(): Promise<SkillRecord[]> {
  if (pb) {
    try {
      return await pb.collection('skills').getFullList<SkillRecord>({
        sort: '+group,+order',
        requestKey: null,
      });
    } catch (err) {
      console.warn('[pocketbase] getSkills failed — using seed data:', (err as Error)?.message);
    }
  }
  return [...SKILLS_SEED];
}

// ── Career path (the "About" section) ──────────────────────────────────

function toCareerItem(r: CareerRecord, locale: Locale): CareerItem {
  const rec = r as unknown as Record<string, unknown>;
  return {
    id: r.id,
    period: r.period,
    company: r.company,
    body: pick(rec, 'body', locale),
    tech: Array.isArray(r.tech) ? r.tech : [],
  };
}

export async function getCareer(locale: Locale): Promise<CareerItem[]> {
  if (pb) {
    try {
      const items = await pb.collection('career').getFullList<CareerRecord>({
        sort: '+order',
        requestKey: null,
      });
      return items.map((r) => toCareerItem(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getCareer failed — using seed data:', (err as Error)?.message);
    }
  }
  return [...CAREER_SEED].sort((a, b) => a.order - b.order).map((r) => toCareerItem(r, locale));
}

// ── News ───────────────────────────────────────────────────────────────

function fileUrl(collectionId: string | undefined, id: string, filename: string): string {
  if (!pb || !collectionId || !filename) return '';
  return pb.files.getURL({ id, collectionId } as never, filename);
}

/** URL for every filename in `filenames` (drops blanks); [] when PB is unset. */
function fileUrls(collectionId: string | undefined, id: string, filenames: unknown): string[] {
  if (!pb || !collectionId || !Array.isArray(filenames)) return [];
  return filenames.filter((f): f is string => typeof f === 'string' && f !== '').map((f) => fileUrl(collectionId, id, f));
}

/** `images` reordered with the primary file first: `primary` if it's one of
 *  `images`, otherwise the original order (so `[0]` is still the cover). */
function imagesPrimaryFirst(images: unknown, primary: unknown): string[] {
  const list = Array.isArray(images) ? images.filter((f): f is string => typeof f === 'string' && f !== '') : [];
  if (typeof primary === 'string' && primary && list.includes(primary)) {
    return [primary, ...list.filter((f) => f !== primary)];
  }
  return list;
}

/** Fill the derived `*Url` / `customer*` fields on a localized project record
 *  from its raw PB record (file fields + the expanded `customer` relation).
 *  Mutates and returns `p`. */
function enrichProject(p: Localized<ProjectRecord>, raw: ProjectRecord): Localized<ProjectRecord> {
  const ordered = imagesPrimaryFirst(raw.images, raw.primary_image);
  p.imageUrls = fileUrls(raw.collectionId, raw.id, ordered);
  p.coverUrl = p.imageUrls[0] ?? '';
  // Prefer the expanded relation (live PB); fall back to a seed lookup by id so
  // the no-backend build links customers too.
  const cust =
    (raw as unknown as { expand?: { customer?: CustomerRecord } }).expand?.customer ??
    (raw.customer ? CUSTOMERS_SEED.find((c) => c.id === raw.customer) : undefined);
  if (cust) {
    p.customerName = cust.name;
    p.customerSlug = cust.slug;
    p.customerLogoUrl = fileUrl(cust.collectionId, cust.id, cust.logo);
  } else {
    p.customerName = '';
    p.customerSlug = '';
    p.customerLogoUrl = '';
  }
  return p;
}

function toNewsItem(r: NewsRecord, locale: Locale): NewsItem {
  const rec = r as unknown as Record<string, unknown>;
  return {
    id: r.id,
    slug: r.slug,
    date: r.date,
    coverUrl: fileUrl(r.collectionId, r.id, r.cover),
    tags: Array.isArray(r.tags) ? r.tags : [],
    title: pick(rec, 'title', locale),
    excerpt: pick(rec, 'excerpt', locale),
    body: pick(rec, 'body', locale),
  };
}

export async function getNews(locale: Locale): Promise<NewsItem[]> {
  if (pb) {
    try {
      const items = await pb.collection('news').getFullList<NewsRecord>({
        sort: '-date,+order',
        requestKey: null,
      });
      return items.map((r) => toNewsItem(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getNews failed — using seed data:', (err as Error)?.message);
    }
  }
  return NEWS_SEED.map((r) => toNewsItem(r, locale));
}

export async function getNewsPost(slug: string, locale: Locale): Promise<NewsItem | null> {
  if (pb) {
    try {
      const r = await pb
        .collection('news')
        .getFirstListItem<NewsRecord>(pb.filter('slug = {:slug}', { slug }), { requestKey: null });
      return toNewsItem(r, locale);
    } catch {
      return null;
    }
  }
  const seed = NEWS_SEED.find((r) => r.slug === slug);
  return seed ? toNewsItem(seed, locale) : null;
}

// ── Customers ──────────────────────────────────────────────────────────

function toCustomerItem(r: CustomerRecord, locale: Locale): CustomerItem {
  const rec = r as unknown as Record<string, unknown>;
  const imageUrls = fileUrls(r.collectionId, r.id, imagesPrimaryFirst(r.images, r.primary_image));
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    sector: r.sector,
    url: r.url,
    logoUrl: fileUrl(r.collectionId, r.id, r.logo),
    primaryImageUrl: imageUrls[0] ?? '',
    imageUrls,
    featured: !!r.featured,
    started: r.started ?? '',
    ended: r.ended ?? '',
    description: pick(rec, 'description', locale),
    testimonial: pick(rec, 'testimonial', locale),
    testimonialAuthor: r.testimonial_author,
  };
}

/** A customer plus the case studies that link to it (most-recent-first). The
 *  `/customers/<slug>` detail page reads this; falls back to seed data. */
export async function getCustomer(slug: string, locale: Locale): Promise<CustomerDetail | null> {
  const projectRef = (p: ProjectRecord): CustomerProjectRef => {
    const rec = p as unknown as Record<string, unknown>;
    const title = (rec[`title_${locale}`] as string) || (rec['title_en'] as string) || '';
    return { slug: p.slug, idx: p.idx, period: p.period, title };
  };
  if (pb) {
    try {
      const r = await pb
        .collection('customers')
        .getFirstListItem<CustomerRecord>(pb.filter('slug = {:slug}', { slug }), { requestKey: null });
      let projects: CustomerProjectRef[] = [];
      try {
        const ps = await pb.collection('projects').getFullList<ProjectRecord>({
          filter: pb.filter('customer = {:id}', { id: r.id }),
          sort: '+order',
          requestKey: null,
        });
        projects = byRecencyPersonalLast(ps).map(projectRef);
      } catch {
        /* leave projects empty */
      }
      return { ...toCustomerItem(r, locale), projects };
    } catch {
      return null;
    }
  }
  const seed = CUSTOMERS_SEED.find((r) => r.slug === slug);
  if (!seed) return null;
  const projects = byRecencyPersonalLast(PROJECTS_SEED.filter((p) => p.customer === seed.id)).map(projectRef);
  return { ...toCustomerItem(seed, locale), projects };
}

export async function getCustomers(locale: Locale): Promise<CustomerItem[]> {
  if (pb) {
    try {
      const items = await pb.collection('customers').getFullList<CustomerRecord>({
        sort: '+order',
        requestKey: null,
      });
      return featuredFirst(items.map((i) => ({ ...i, order: i.order ?? 0 }))).map((r) =>
        toCustomerItem(r, locale),
      );
    } catch (err) {
      console.warn('[pocketbase] getCustomers failed — using seed data:', (err as Error)?.message);
    }
  }
  return CUSTOMERS_SEED.map((r) => toCustomerItem(r, locale));
}

// ── Pages (arbitrary trilingual content pages: /privacy, /imprint, …) ──

function toPageItem(r: PageRecord, locale: Locale): PageItem {
  const rec = r as unknown as Record<string, unknown>;
  return {
    id: r.id,
    slug: r.slug,
    title: pick(rec, 'title', locale),
    body: pick(rec, 'body', locale),
  };
}

export async function getPages(locale: Locale): Promise<PageItem[]> {
  if (pb) {
    try {
      const items = await pb.collection('pages').getFullList<PageRecord>({
        sort: '+order',
        filter: 'published = true',
        requestKey: null,
      });
      return items.map((r) => toPageItem(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getPages failed — using seed data:', (err as Error)?.message);
    }
  }
  return PAGES_SEED.filter((r) => r.published)
    .sort((a, b) => a.order - b.order)
    .map((r) => toPageItem(r, locale));
}

export async function getPage(slug: string, locale: Locale): Promise<PageItem | null> {
  if (pb) {
    try {
      const r = await pb
        .collection('pages')
        .getFirstListItem<PageRecord>(pb.filter('slug = {:slug} && published = true', { slug }), {
          requestKey: null,
        });
      return toPageItem(r, locale);
    } catch {
      return null;
    }
  }
  const seed = PAGES_SEED.find((r) => r.slug === slug && r.published);
  return seed ? toPageItem(seed, locale) : null;
}

// ── Socials (footer "Elsewhere" links) ─────────────────────────────────

/** The footer's social links, in display order. Read fresh on every request
 *  (the admin can edit/reorder them in PocketBase — see `{PB_URL}/socials-order`),
 *  falling back to `SOCIALS_SEED` when PocketBase is unreachable. */
export async function getSocials(): Promise<SocialRecord[]> {
  if (pb) {
    try {
      const items = await pb.collection('socials').getFullList<SocialRecord>({
        sort: '+order,+created',
        requestKey: null,
      });
      return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (err) {
      console.warn('[pocketbase] getSocials failed — using seed data:', (err as Error)?.message);
    }
  }
  return [...SOCIALS_SEED].sort((a, b) => a.order - b.order);
}
