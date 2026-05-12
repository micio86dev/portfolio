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
  NEWS_SEED,
  CUSTOMERS_SEED,
  PAGES_SEED,
  type ProjectRecord,
  type ServiceRecord,
  type SkillRecord,
  type CourseRecord,
  type NewsRecord,
  type NewsItem,
  type CustomerRecord,
  type CustomerItem,
  type PageRecord,
  type PageItem,
  type Localized,
} from './seed-data';

const PB_URL =
  (typeof process !== 'undefined' ? process.env.PUBLIC_PB_URL : undefined) ||
  (import.meta.env.PUBLIC_PB_URL as string | undefined);

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
        requestKey: null,
      });
      return featuredFirst(items).map((r) => localize(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getProjects failed — using seed data:', (err as Error)?.message);
    }
  }
  return featuredFirst(PROJECTS_SEED).map((r) => localize(r, locale));
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
          requestKey: null,
        });
      return localize(r, locale);
    } catch {
      return null;
    }
  }
  const seed = PROJECTS_SEED.find((r) => r.slug === slug);
  return seed ? localize(seed, locale) : null;
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

// ── News ───────────────────────────────────────────────────────────────

function fileUrl(collectionId: string | undefined, id: string, filename: string): string {
  if (!pb || !collectionId || !filename) return '';
  return pb.files.getURL({ id, collectionId } as never, filename);
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
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    sector: r.sector,
    url: r.url,
    logoUrl: fileUrl(r.collectionId, r.id, r.logo),
    featured: !!r.featured,
    description: pick(rec, 'description', locale),
    testimonial: pick(rec, 'testimonial', locale),
    testimonialAuthor: r.testimonial_author,
  };
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
