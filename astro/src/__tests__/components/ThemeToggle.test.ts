import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ThemeToggle from '../../components/vue/ThemeToggle.vue';

const STORAGE_KEY = 'miciodev-theme';

describe('ThemeToggle.vue', () => {
  it('syncs its initial state from <html data-theme>', async () => {
    document.documentElement.dataset.theme = 'dark';
    const w = mount(ThemeToggle);
    await flushPromises(); // onMounted reads the bootstrap attribute → re-render
    const btn = w.get('button');
    expect(btn.attributes('aria-pressed')).toBe('true');
    expect(btn.attributes('aria-label')).toBe('Switch to light mode');
  });

  it('reads "light" from the bootstrap attribute and labels the dark action', () => {
    document.documentElement.dataset.theme = 'light';
    const w = mount(ThemeToggle);
    const btn = w.get('button');
    expect(btn.attributes('aria-pressed')).toBe('false');
    expect(btn.attributes('aria-label')).toBe('Switch to dark mode');
  });

  it('toggles data-theme and persists the choice to localStorage on click', async () => {
    document.documentElement.dataset.theme = 'light';
    const w = mount(ThemeToggle);

    await w.get('button').trigger('click');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(w.get('button').attributes('aria-pressed')).toBe('true');

    await w.get('button').trigger('click');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(w.get('button').attributes('aria-pressed')).toBe('false');
  });

  it('honours custom labels', async () => {
    document.documentElement.dataset.theme = 'light';
    const w = mount(ThemeToggle, {
      props: { labelToLight: 'Light please', labelToDark: 'Dark please' },
    });
    expect(w.get('button').attributes('aria-label')).toBe('Dark please');
    await w.get('button').trigger('click');
    expect(w.get('button').attributes('aria-label')).toBe('Light please');
  });

  it('follows the OS scheme only when the user has not chosen manually', () => {
    // Capture the `change` listener the component registers on the media query.
    let changeHandler: ((e: { matches: boolean }) => void) | undefined;
    const mql = {
      matches: false,
      addEventListener: (_: string, h: (e: { matches: boolean }) => void) => {
        changeHandler = h;
      },
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

    document.documentElement.dataset.theme = 'light';
    window.localStorage.clear();
    mount(ThemeToggle);
    expect(typeof changeHandler).toBe('function');

    // No manual choice saved → the component follows the OS.
    changeHandler!({ matches: true });
    expect(document.documentElement.dataset.theme).toBe('dark');

    // A saved choice → the OS change is ignored.
    window.localStorage.setItem(STORAGE_KEY, 'light');
    changeHandler!({ matches: true });
    expect(document.documentElement.dataset.theme).toBe('dark'); // unchanged from above
    changeHandler!({ matches: false });
    expect(document.documentElement.dataset.theme).toBe('dark'); // still ignored
  });
});
