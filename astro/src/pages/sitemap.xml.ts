/**
 * Dynamic multilingual sitemap.
 *
 * One `<url>` entry per public route, emitted for the EN URL with
 * `<xhtml:link rel="alternate" hreflang="…">` pointing at the localized
 * variants (en/it/es + x-default=en). Project and notes URLs are pulled live
 * from PocketBase (with the bundled seed-data fallback baked into the helpers).
 */

import type { APIContext } from 'astro';
import { getProjects, getNews } from '../lib/pocketbase';
import { LOCALES, siteUrl, localizedPath, xmlEscape, type Locale } from '../lib/seo';

export const prerender = false;

interface Entry {
  /** Neutral path, e.g. `/projects` or `/projects/devboards-io`. */
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

/** Normalise an arbitrary date-ish value to `YYYY-MM-DD`, or undefined. */
function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function urlEntry(base: string, entry: Entry): string {
  const links = LOCALES.map((loc) => {
    const href = xmlEscape(base + localizedPath(entry.path, loc as Locale));
    return `    <xhtml:link rel="alternate" hreflang="${loc}" href="${href}"/>`;
  });
  // x-default → EN
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(
      base + localizedPath(entry.path, 'en'),
    )}"/>`,
  );
  const loc = xmlEscape(base + localizedPath(entry.path, 'en'));
  const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : '';
  return [
    '  <url>',
    `    <loc>${loc}</loc>${lastmod}`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    ...links,
    '  </url>',
  ].join('\n');
}

export async function GET({ request, site }: APIContext): Promise<Response> {
  const base = siteUrl(site, request.url);

  const entries: Entry[] = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/projects', priority: '0.7', changefreq: 'weekly' },
    { path: '/notes', priority: '0.5', changefreq: 'weekly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/imprint', priority: '0.3', changefreq: 'yearly' },
  ];

  const [projects, news] = await Promise.all([getProjects('en'), getNews('en')]);

  for (const p of projects) {
    const rec = p as unknown as Record<string, unknown>;
    if (!p.slug) continue;
    entries.push({
      path: `/projects/${p.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: toIsoDate(rec.updated) ?? toIsoDate(rec.created),
    });
  }

  for (const n of news) {
    const rec = n as unknown as Record<string, unknown>;
    if (!n.slug) continue;
    entries.push({
      path: `/notes/${n.slug}`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: toIsoDate(rec.updated) ?? toIsoDate(n.date),
    });
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    entries.map((e) => urlEntry(base, e)).join('\n') +
    '\n</urlset>\n';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
