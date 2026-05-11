/**
 * Resend integration — server-only. Imported by src/pages/api/contact.ts.
 * Do not import from client components.
 */

import { Resend } from 'resend';

export type ContactSubject = 'general' | 'estimate' | 'consulting' | 'other';

export interface ContactPayload {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
}

const SUBJECT_LABEL: Record<ContactSubject, string> = {
  general: 'General inquiry',
  estimate: 'Project estimate',
  consulting: 'Consulting',
  other: 'Other',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Collapse newlines/control chars so a value is safe to drop into an email header (e.g. Subject). */
function sanitizeHeader(s: string): string {
  return s.replace(/[\r\n\t\f\v]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 120);
}

// TODO: rate limiting — the contact endpoint (src/pages/api/contact.ts) does a
// per-IP, in-memory limit (5 req / 60 s). Move it to a shared store (KV / Redis)
// before running multiple instances, and consider a Resend-side send cap here.

/**
 * Send a contact-form submission via Resend.
 * Throws if RESEND_API_KEY / CONTACT_TO_EMAIL are missing or the send fails —
 * the caller (API route) maps that to a 500.
 */
export async function sendContactEmail(payload: ContactPayload): Promise<{ id: string | null }> {
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  const to = import.meta.env.CONTACT_TO_EMAIL as string | undefined;
  const from = (import.meta.env.CONTACT_FROM_EMAIL as string | undefined) ?? 'MicioDev <hello@miciodev.com>';

  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  if (!to) throw new Error('CONTACT_TO_EMAIL is not configured');

  const resend = new Resend(apiKey);
  const subjectLabel = SUBJECT_LABEL[payload.subject] ?? 'Contact';
  const safeName = sanitizeHeader(payload.name);

  const text = [
    `New contact-form submission — ${subjectLabel}`,
    '',
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    `Subject: ${subjectLabel}`,
    '',
    payload.message,
  ].join('\n');

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; color:#0E0E0C; line-height:1.55;">
      <p style="font:500 11px/1 ui-monospace, monospace; letter-spacing:.14em; text-transform:uppercase; color:#6E6E64;">
        New contact-form submission · ${escapeHtml(subjectLabel)}
      </p>
      <table style="border-collapse:collapse; margin:16px 0; font-size:14px;">
        <tr><td style="padding:4px 16px 4px 0; color:#6E6E64;">Name</td><td>${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding:4px 16px 4px 0; color:#6E6E64;">Email</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding:4px 16px 4px 0; color:#6E6E64;">Subject</td><td>${escapeHtml(subjectLabel)}</td></tr>
      </table>
      <div style="white-space:pre-wrap; padding:16px; background:#FAFAF7; border:1px solid #E2E2DA; border-radius:8px;">${escapeHtml(payload.message)}</div>
    </div>`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `[miciodev] ${subjectLabel} — ${safeName}`,
    text,
    html,
  });

  if (error) throw new Error(error.message);
  return { id: data?.id ?? null };
}
