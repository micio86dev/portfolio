/**
 * PocketBase client + build-time fetch helpers.
 *
 * Pages call `getProjects(locale)` / `getServices(locale)` from their Astro
 * frontmatter (prerendered at build time). If `PB_URL` is unset or the
 * instance is unreachable, we fall back to the structural seed data so the
 * site always builds. Point a webhook from PocketBase → your host's deploy
 * hook to rebuild on content change.
 */

import PocketBase from 'pocketbase';
import type { Locale } from '../i18n/utils';
import {
  PROJECTS_SEED,
  SERVICES_SEED,
  type ProjectRecord,
  type ServiceRecord,
  type Localized,
} from './seed-data';

const PB_URL = import.meta.env.PB_URL as string | undefined;

/** Singleton client. Safe to import anywhere; `null` when PB_URL is not set. */
export const pb: PocketBase | null = PB_URL ? new PocketBase(PB_URL) : null;

function localize<T extends ServiceRecord | ProjectRecord>(
  record: T,
  locale: Locale,
): Localized<T> {
  const rest = { ...(record as unknown as Record<string, unknown>) };
  const title = rest[`title_${locale}`];
  const desc = rest[`desc_${locale}`];
  // Drop every per-locale variant; expose only the resolved title/desc.
  for (const l of ['en', 'it', 'es']) {
    delete rest[`title_${l}`];
    delete rest[`desc_${l}`];
  }
  return { ...rest, title: String(title ?? ''), desc: String(desc ?? '') } as unknown as Localized<T>;
}

/** Featured-first ordering for the projects grid (one featured card up top). */
function featuredFirst<T extends { featured: boolean; order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.order - b.order;
  });
}

export async function getProjects(locale: Locale): Promise<Localized<ProjectRecord>[]> {
  if (pb) {
    try {
      const items = await pb.collection('projects').getFullList<ProjectRecord>({
        sort: '+order',
        // build-time, no auth store — public read rule assumed on the collection
        requestKey: null,
      });
      return featuredFirst(items).map((r) => localize(r, locale));
    } catch (err) {
      console.warn('[pocketbase] getProjects failed — using seed data:', (err as Error)?.message);
    }
  }
  return featuredFirst(PROJECTS_SEED).map((r) => localize(r, locale));
}

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
