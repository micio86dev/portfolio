/**
 * Dynamic robots.txt.
 *
 * Staging (`stage.…`) is fully disallowed so it never gets indexed; production
 * allows everything except `/api/`, advertises the sitemap, and points AI
 * crawlers at the llms.txt files.
 */

import type { APIContext } from 'astro';
import { siteUrl, isStagingHost } from '../lib/seo';

export const prerender = false;

export async function GET({ request, site }: APIContext): Promise<Response> {
  const base = siteUrl(site, request.url);
  let staging = isStagingHost(base);
  try {
    if (new URL(request.url).hostname.startsWith('stage.')) staging = true;
  } catch {
    /* ignore */
  }

  const body = staging
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        `Sitemap: ${base}/sitemap.xml`,
        '',
        '# AI agents',
        'User-agent: GPTBot',
        'Allow: /llms.txt',
        'Allow: /llms-full.txt',
        '',
        'User-agent: Claude-Web',
        'Allow: /llms.txt',
        'Allow: /llms-full.txt',
        '',
      ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
