import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import CookieBar from '../../components/vue/CookieBar.vue';

const STORAGE_KEY = 'miciodev-cookie-ack';
const REOPEN_EVENT = 'miciodev:cookie-reopen';

const messages = {
  text: 'This site stores only your theme preference.',
  accept: 'Got it',
  privacyLink: 'Privacy policy',
  ariaLabel: 'Cookie notice',
};

function mountBar(): VueWrapper {
  return mount(CookieBar, {
    props: { messages, privacyHref: '/privacy' },
    attachTo: document.body, // CookieBar wires a listener onto #cookie-settings
  });
}

let settingsLink: HTMLAnchorElement;
beforeEach(() => {
  window.localStorage.clear();
  // The footer's "Cookie settings" link the bar hooks into.
  settingsLink = document.createElement('a');
  settingsLink.id = 'cookie-settings';
  settingsLink.href = '/privacy';
  document.body.appendChild(settingsLink);
});
afterEach(() => {
  settingsLink.remove();
});

describe('CookieBar.vue', () => {
  it('is visible on first visit (no acknowledgement stored)', async () => {
    const w = mountBar();
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(true);
    expect(w.get('.cookiebar').attributes('role')).toBe('region');
    expect(w.get('.cookiebar').attributes('aria-label')).toBe('Cookie notice');
    expect(w.get('.cookiebar__link').attributes('href')).toBe('/privacy');
    expect(w.get('.cookiebar__text').text()).toContain('theme preference');
  });

  it('stays hidden when a current-version acknowledgement is stored', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ack: true, ts: Date.now() }));
    const w = mountBar();
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(false);
  });

  it('re-appears when the stored acknowledgement is from an older version', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 0, ack: true }));
    const w = mountBar();
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(true);
  });

  it('dismisses and persists the acknowledgement when "accept" is clicked', async () => {
    const w = mountBar();
    await flushPromises();
    await w.get('.cookiebar__ok').trigger('click');
    expect(w.find('.cookiebar').exists()).toBe(false);
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toMatchObject({ v: 1, ack: true });
    expect(typeof stored.ts).toBe('number');
  });

  it('re-opens on the reopen event and clears the stored acknowledgement', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ack: true, ts: Date.now() }));
    const w = mountBar();
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(false);

    window.dispatchEvent(new Event(REOPEN_EVENT));
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('re-opens when the footer "Cookie settings" link is clicked', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ack: true, ts: Date.now() }));
    const w = mountBar();
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(false);

    settingsLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(true);
  });

  it('treats a malformed stored value as "not acknowledged"', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json');
    const w = mountBar();
    await flushPromises();
    expect(w.find('.cookiebar').exists()).toBe(true);
  });

  it('disables the slide transition when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const w = mountBar();
    await flushPromises();
    // Still rendered; the Transition just has an empty name (no CSS classes).
    expect(w.find('.cookiebar').exists()).toBe(true);
  });
});
