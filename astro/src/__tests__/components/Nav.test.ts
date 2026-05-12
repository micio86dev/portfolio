import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import Nav from '../../components/vue/Nav.vue';

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    lang: 'en' as const,
    basePath: '/',
    homeHref: '/',
    hireHref: '/#contact',
    logo: { src: '/logo.jpg', width: 30, height: 30 },
    links: [
      { href: '/#about', num: '01', label: 'About' },
      { href: '/#services', num: '02', label: 'Services' },
      { href: '/#work', num: '03', label: 'Projects', active: true },
      { href: '/#contact', num: '04', label: 'Contact' },
    ],
    messages: {
      home: 'Home',
      hireMe: 'Hire me',
      mainNav: 'Main navigation',
      statusAvailable: 'Available',
      statusLocation: 'Canary Islands',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      toLight: 'Switch to light mode',
      toDark: 'Switch to dark mode',
      language: 'Language',
    },
    ...overrides,
  };
}

let wrapper: VueWrapper | undefined;
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('Nav.vue', () => {
  it('renders a nav with the provided links and aria-label', () => {
    wrapper = mount(Nav, { props: makeProps() });
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Main navigation');
    const linkTexts = wrapper.findAll('.nav-link').map((a) => a.text());
    expect(linkTexts.join(' ')).toContain('About');
    expect(linkTexts.join(' ')).toContain('Contact');
  });

  it('marks the active section link with aria-current', () => {
    wrapper = mount(Nav, { props: makeProps() });
    const active = wrapper.findAll('.nav-link').filter((a) => a.attributes('aria-current') === 'page');
    expect(active).toHaveLength(1);
    expect(active[0].text()).toContain('Projects');
  });

  it('renders the language switcher with the active locale checked and the theme toggle', () => {
    wrapper = mount(Nav, { props: makeProps({ lang: 'es' }) });
    // LangSwitch island: the radiogroup has the active locale's option checked.
    const radiogroup = wrapper.findAll('[role="radiogroup"]')[0];
    expect(radiogroup.attributes('aria-label')).toBe('Language');
    const checked = radiogroup.findAll('[role="radio"]').filter((r) => r.attributes('aria-checked') === 'true');
    expect(checked).toHaveLength(1);
    expect(checked[0].text()).toBe('ES');
    // ThemeToggle island: present, labelled from the passed messages.
    expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('Switch to dark mode');
  });

  // `v-show` toggles the drawer's inline `display` style; treat "no display:none"
  // as open. Reading `aria-expanded` off the burger is the other source of truth.
  const drawerOpen = (w: VueWrapper) => (w.get('.nav-drawer').element as HTMLElement).style.display !== 'none';

  it('opens and closes the mobile drawer from the burger button', async () => {
    wrapper = mount(Nav, { props: makeProps() });
    const burger = wrapper.get('.nav-burger');

    expect(drawerOpen(wrapper)).toBe(false);
    expect(burger.attributes('aria-expanded')).toBe('false');
    expect(burger.attributes('aria-label')).toBe('Open menu');

    await burger.trigger('click');
    await flushPromises();
    expect(drawerOpen(wrapper)).toBe(true);
    expect(burger.attributes('aria-expanded')).toBe('true');
    expect(burger.attributes('aria-label')).toBe('Close menu');

    await burger.trigger('click');
    await flushPromises();
    expect(drawerOpen(wrapper)).toBe(false);
    expect(burger.attributes('aria-expanded')).toBe('false');
  });

  it('closes the drawer when a drawer link is clicked', async () => {
    wrapper = mount(Nav, { props: makeProps() });
    await wrapper.get('.nav-burger').trigger('click');
    await flushPromises();
    expect(drawerOpen(wrapper)).toBe(true);

    await wrapper.get('.nav-drawer__link').trigger('click');
    await flushPromises();
    expect(drawerOpen(wrapper)).toBe(false);
    expect(wrapper.get('.nav-burger').attributes('aria-expanded')).toBe('false');
  });

  it('closes the drawer on Escape', async () => {
    wrapper = mount(Nav, { props: makeProps(), attachTo: document.body });
    await wrapper.get('.nav-burger').trigger('click');
    await flushPromises();
    expect(drawerOpen(wrapper)).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();
    expect(drawerOpen(wrapper)).toBe(false);
    expect(wrapper.get('.nav-burger').attributes('aria-expanded')).toBe('false');
  });

  it('updates the active link when a link is clicked', async () => {
    wrapper = mount(Nav, { props: makeProps() });
    const aboutLink = wrapper.findAll('.nav-link').find((a) => a.text().includes('About'))!;
    await aboutLink.trigger('click');
    expect(aboutLink.attributes('aria-current')).toBe('page');
    const stillActive = wrapper.findAll('.nav-link').filter((a) => a.attributes('aria-current') === 'page');
    expect(stillActive).toHaveLength(1);
  });

  describe('scroll / hash / scroll-spy wiring', () => {
    type IoCallback = (entries: { isIntersecting: boolean; target: { id: string } }[]) => void;
    let ioCallback: IoCallback | undefined;
    const sectionIds = ['about', 'services', 'work', 'contact'];

    beforeEach(() => {
      // Section anchors the scroll-spy observes…
      for (const id of sectionIds) {
        const el = document.createElement('section');
        el.id = id;
        document.body.appendChild(el);
      }
      // …a microtask-backed rAF so the scroll handler runs after `await
      // flushPromises()` (and *after* the id is stored, like a real rAF)…
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        Promise.resolve().then(() => cb(0));
        return 42;
      });
      vi.stubGlobal('cancelAnimationFrame', vi.fn());
      // …and a minimal IntersectionObserver that hands us its callback.
      class FakeIO {
        constructor(cb: IoCallback) {
          ioCallback = cb;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      }
      vi.stubGlobal('IntersectionObserver', FakeIO);
      window.location.hash = '';
    });

    afterEach(() => {
      for (const id of sectionIds) document.getElementById(id)?.remove();
      vi.unstubAllGlobals();
      ioCallback = undefined;
      window.location.hash = '';
    });

    const activeLabel = (w: VueWrapper) =>
      w.findAll('.nav-link').find((a) => a.attributes('aria-current') === 'page')?.text() ?? '';

    it('adds the scrolled state past 50px of scroll', async () => {
      wrapper = mount(Nav, { props: makeProps(), attachTo: document.body });
      expect(wrapper.get('.nav-root').classes()).not.toContain('is-scrolled');

      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
      window.dispatchEvent(new Event('scroll'));
      await flushPromises();
      expect(wrapper.get('.nav-root').classes()).toContain('is-scrolled');

      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      window.dispatchEvent(new Event('scroll'));
      await flushPromises();
      expect(wrapper.get('.nav-root').classes()).not.toContain('is-scrolled');
    });

    it('tracks the active section from the URL hash', async () => {
      wrapper = mount(Nav, { props: makeProps(), attachTo: document.body });
      window.location.hash = '#contact';
      window.dispatchEvent(new Event('hashchange'));
      await flushPromises();
      expect(activeLabel(wrapper)).toContain('Contact');
    });

    it('follows the IntersectionObserver into and out of the active band', async () => {
      wrapper = mount(Nav, { props: makeProps(), attachTo: document.body });
      expect(ioCallback).toBeTypeOf('function');

      ioCallback!([{ isIntersecting: true, target: { id: 'services' } }]);
      await flushPromises();
      expect(activeLabel(wrapper)).toContain('Services');

      // A later section also enters → it wins (last in document order).
      ioCallback!([{ isIntersecting: true, target: { id: 'work' } }]);
      await flushPromises();
      expect(activeLabel(wrapper)).toContain('Projects'); // the #work link is labelled "Projects"

      // It leaves again → the earlier still-intersecting section takes over.
      ioCallback!([{ isIntersecting: false, target: { id: 'work' } }]);
      await flushPromises();
      expect(activeLabel(wrapper)).toContain('Services');
    });
  });
});
