import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import LangSwitch from '../../components/vue/LangSwitch.vue';

let wrapper: VueWrapper | undefined;
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('LangSwitch.vue', () => {
  it('renders one radio per locale with the current one checked', () => {
    wrapper = mount(LangSwitch, { props: { current: 'it', basePath: '/' } });
    const opts = wrapper.findAll('a[role="radio"]');
    expect(opts).toHaveLength(3);
    expect(opts.map((o) => o.text())).toEqual(['EN', 'IT', 'ES']);
    expect(opts.map((o) => o.attributes('aria-checked'))).toEqual(['false', 'true', 'false']);
    // Only the active option is in the tab order.
    expect(opts.map((o) => o.attributes('tabindex'))).toEqual(['-1', '0', '-1']);
    expect(wrapper.attributes('role')).toBe('radiogroup');
  });

  it('builds locale-prefixed hrefs from the base path (default locale unprefixed)', () => {
    wrapper = mount(LangSwitch, { props: { current: 'en', basePath: '/projects/foo' } });
    const hrefs = wrapper.findAll('a[role="radio"]').map((o) => o.attributes('href'));
    expect(hrefs).toEqual(['/projects/foo', '/it/projects/foo', '/es/projects/foo']);
  });

  it('maps the home path to "/" and "/<locale>/"', () => {
    wrapper = mount(LangSwitch, { props: { current: 'en', basePath: '/' } });
    const hrefs = wrapper.findAll('a[role="radio"]').map((o) => o.attributes('href'));
    expect(hrefs).toEqual(['/', '/it/', '/es/']);
  });

  it('moves focus with arrow keys and wraps around', async () => {
    wrapper = mount(LangSwitch, {
      props: { current: 'en', basePath: '/' },
      attachTo: document.body,
    });
    const opts = wrapper.findAll('a[role="radio"]');

    await opts[0].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(opts[1].element);

    await opts[1].trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(opts[2].element);

    // Wrap forward from the last option.
    await opts[2].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(opts[0].element);

    // Wrap backward from the first option.
    await opts[0].trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(opts[2].element);

    await opts[2].trigger('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(opts[1].element);
  });

  it('jumps to the first/last option with Home/End', async () => {
    wrapper = mount(LangSwitch, {
      props: { current: 'it', basePath: '/' },
      attachTo: document.body,
    });
    const opts = wrapper.findAll('a[role="radio"]');

    await opts[1].trigger('keydown', { key: 'End' });
    expect(document.activeElement).toBe(opts[2].element);

    await opts[2].trigger('keydown', { key: 'Home' });
    expect(document.activeElement).toBe(opts[0].element);
  });

  it('ignores unrelated keys', async () => {
    wrapper = mount(LangSwitch, {
      props: { current: 'en', basePath: '/' },
      attachTo: document.body,
    });
    const opts = wrapper.findAll('a[role="radio"]');
    (opts[1].element as HTMLElement).focus();
    await opts[1].trigger('keydown', { key: 'Enter' });
    expect(document.activeElement).toBe(opts[1].element);
  });
});
