import type { APIRoute } from 'astro';
import { sendContactEmail, type ContactSubject } from '../../lib/resend';

// Dynamic endpoint — not prerendered. Served on demand by the configured
// adapter (Node standalone by default; swap in astro.config.mjs for your host).
export const prerender = false;

const MIN_MESSAGE = 20;
const MAX_MESSAGE = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SUBJECTS: ContactSubject[] = ['general', 'estimate', 'consulting', 'other'];

// In-memory, per-IP rate limit: 5 requests / 60 s. Resets on server restart.
// For multi-instance deployments swap this for a shared store (KV / Redis).
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((ts) => now - ts < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';

  if (rateLimited(ip)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const subject = typeof payload.subject === 'string' ? payload.subject : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const honeypot = typeof payload.website === 'string' ? payload.website.trim() : '';

  // Honeypot: a real user never fills this. Silently accept and drop.
  if (honeypot !== '') {
    return json({ ok: true });
  }

  const errors: Record<string, string> = {};
  if (!name) errors.name = 'required';
  if (!EMAIL_RE.test(email)) errors.email = 'invalid';
  if (message.length < MIN_MESSAGE) errors.message = 'too_short';
  else if (message.length > MAX_MESSAGE) errors.message = 'too_long';
  if (!VALID_SUBJECTS.includes(subject as ContactSubject)) errors.subject = 'invalid';

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, error: 'validation', fields: errors }, 400);
  }

  try {
    await sendContactEmail({
      name,
      email,
      subject: subject as ContactSubject,
      message,
    });
    return json({ ok: true });
  } catch (err) {
    console.error('[api/contact] send failed:', (err as Error)?.message);
    return json({ ok: false, error: 'send_failed' }, 500);
  }
};
