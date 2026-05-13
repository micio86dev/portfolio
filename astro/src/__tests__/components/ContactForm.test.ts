import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';

// The form's scroll-reveal animation is purely cosmetic ("visual only; never
// alters submit/validation logic" — see ContactForm.vue). Stub the composable
// and GSAP so jsdom (no `matchMedia` at import time, no layout engine) doesn't
// trip over ScrollTrigger when the module graph loads.
vi.mock('../../composables/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ animateOnScroll: vi.fn() }),
}));
vi.mock('gsap', () => ({
  default: { fromTo: vi.fn(), to: vi.fn(), registerPlugin: vi.fn() },
}));

import ContactForm from '../../components/vue/ContactForm.vue';

const PB_URL = 'https://pb.test';
const CONTACT_EMAIL = 'hello@example.com';
const ENDPOINT = `${PB_URL}/api/collections/contacts/records`;

const messages = {
  ariaLabel: 'Contact form',
  honeypotLabel: 'Leave this empty',
  name: 'Name',
  namePlaceholder: 'Your name',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  subject: 'Subject',
  subjectPlaceholder: 'What is it about?',
  message: 'Message',
  messagePlaceholder: 'Tell me more…',
  charCounter: '{count} / 2000',
  privacy: 'By sending you accept the {link}.',
  privacyLinkText: 'privacy policy',
  submit: 'Send message',
  sending: 'Sending…',
  success: 'Thanks — I will reply soon.',
  error: 'Something went wrong — email me at {email}.',
  errors: {
    name: 'Please enter your name.',
    email: 'Please enter a valid email.',
    subject: 'Please enter a subject.',
    messageShort: 'Message is too short.',
    messageLong: 'Message is too long.',
    rateLimit: 'Too many attempts — try again later.',
  },
};

function mountForm(): VueWrapper {
  return mount(ContactForm, {
    props: { messages, pbUrl: PB_URL, contactEmail: CONTACT_EMAIL, privacyHref: '/privacy' },
  });
}

async function fillValid(w: VueWrapper, over: Partial<Record<'name' | 'email' | 'subject' | 'message', string>> = {}) {
  await w.get('#cf-name').setValue(over.name ?? 'Ada Lovelace');
  await w.get('#cf-email').setValue(over.email ?? 'ada@example.com');
  await w.get('#cf-subject').setValue(over.subject ?? 'A project idea');
  await w.get('#cf-message').setValue(over.message ?? 'I would like to discuss a Laravel + Vue project with you.');
}

beforeEach(() => {
  // The component gates its GSAP reveal on `prefers-reduced-motion`; running the
  // suite in a reduced-motion environment keeps animation out of the way.
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('prefers-reduced-motion'),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ContactForm.vue — markup & a11y', () => {
  it('exposes a polite live region for status feedback', () => {
    const w = mountForm();
    const region = w.get('.cf__feedback');
    expect(region.attributes('role')).toBe('status');
    expect(region.attributes('aria-live')).toBe('polite');
    expect(w.get('form').attributes('aria-label')).toBe('Contact form');
    expect(w.get('form').attributes('novalidate')).toBeDefined();
  });

  it('renders the privacy line with a real link around the {link} token', () => {
    const w = mountForm();
    const link = w.get('.cf__privacy-link');
    expect(link.attributes('href')).toBe('/privacy');
    expect(link.text()).toBe('privacy policy');
    expect(w.get('.cf__privacy').text()).toContain('By sending you accept the');
  });

  it('shows a live character counter for the message field', async () => {
    const w = mountForm();
    expect(w.get('.cf__counter').text()).toBe('0 / 2000');
    await w.get('#cf-message').setValue('hello');
    expect(w.get('.cf__counter').text()).toBe('5 / 2000');
  });
});

describe('ContactForm.vue — validation', () => {
  it('blocks submission of an empty form and surfaces field errors', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const w = mountForm();

    await w.get('form').trigger('submit');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(w.get('#cf-name-err').text()).toBe(messages.errors.name);
    expect(w.get('#cf-email-err').text()).toBe(messages.errors.email);
    expect(w.get('#cf-subject-err').text()).toBe(messages.errors.subject);
    expect(w.get('#cf-message-err').text()).toBe(messages.errors.messageShort);
    expect(w.get('#cf-name').attributes('aria-invalid')).toBe('true');
  });

  it('rejects an invalid email and clears the error once fixed', async () => {
    const w = mountForm();
    await fillValid(w, { email: 'not-an-email' });
    await w.get('form').trigger('submit');
    expect(w.get('#cf-email-err').text()).toBe(messages.errors.email);

    await w.get('#cf-email').setValue('ada@example.com');
    expect(w.get('#cf-email-err').text()).toBe('');
  });

  it('rejects a too-short message', async () => {
    const w = mountForm();
    await fillValid(w, { message: 'short' });
    await w.get('form').trigger('submit');
    expect(w.get('#cf-message-err').text()).toBe(messages.errors.messageShort);
  });
});

describe('ContactForm.vue — honeypot', () => {
  it('silently "succeeds" without sending anything when the honeypot is filled', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const w = mountForm();

    await fillValid(w);
    await w.get('#cf-website').setValue('http://spam.example');
    await w.get('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(w.get('.cf__feedback').text()).toBe(messages.success);
    expect(w.get('.cf__feedback').classes()).toContain('is-success');
    // Form is reset after the fake success.
    expect((w.get('#cf-name').element as HTMLInputElement).value).toBe('');
  });
});

describe('ContactForm.vue — submission', () => {
  it('POSTs the trimmed fields to PocketBase and shows the success state', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    const w = mountForm();

    await fillValid(w, { name: '  Ada  ', subject: '  Hi  ' });
    await w.get('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/json');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hi',
      message: 'I would like to discuss a Laravel + Vue project with you.',
    });
    // Honeypot is never transmitted.
    expect(body).not.toHaveProperty('website');

    expect(w.get('.cf__feedback').text()).toBe(messages.success);
    expect(w.get('.cf__feedback').classes()).toContain('is-success');
    expect((w.get('#cf-name').element as HTMLInputElement).value).toBe('');
  });

  it('shows the rate-limit message on HTTP 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    const w = mountForm();
    await fillValid(w);
    await w.get('form').trigger('submit');
    await flushPromises();
    expect(w.get('.cf__feedback').text()).toBe(messages.errors.rateLimit);
    expect(w.get('.cf__feedback').classes()).toContain('is-error');
  });

  it('shows the generic error (with the contact email) on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const w = mountForm();
    await fillValid(w);
    await w.get('form').trigger('submit');
    await flushPromises();
    expect(w.get('.cf__feedback').text()).toBe(`Something went wrong — email me at ${CONTACT_EMAIL}.`);
    expect(w.get('.cf__feedback').classes()).toContain('is-error');
  });

  it('shows the generic error when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const w = mountForm();
    await fillValid(w);
    await w.get('form').trigger('submit');
    await flushPromises();
    expect(w.get('.cf__feedback').text()).toBe(`Something went wrong — email me at ${CONTACT_EMAIL}.`);
    expect(w.get('.cf__feedback').classes()).toContain('is-error');
  });
});
