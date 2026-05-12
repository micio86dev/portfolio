import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PbImage from '../../components/vue/PbImage.vue';

describe('PbImage.vue', () => {
  const base = { src: 'https://pb.test/api/files/c/r/cover.webp', alt: 'A cover', width: 800, height: 450 };

  it('renders an <img> with the given src/alt/dimensions and lazy-loads by default', () => {
    const w = mount(PbImage, { props: base });
    const img = w.get('img');
    expect(img.attributes('src')).toBe(base.src);
    expect(img.attributes('alt')).toBe('A cover');
    expect(img.attributes('width')).toBe('800');
    expect(img.attributes('height')).toBe('450');
    expect(img.attributes('loading')).toBe('lazy');
    expect(img.attributes('fetchpriority')).toBe('auto');
    expect(img.attributes('decoding')).toBe('async');
  });

  it('prioritizes the image when `eager` is set (LCP candidate)', () => {
    const w = mount(PbImage, { props: { ...base, eager: true } });
    const img = w.get('img');
    expect(img.attributes('loading')).toBe('eager');
    expect(img.attributes('fetchpriority')).toBe('high');
  });

  it('passes fall-through attributes onto the root <img>', () => {
    const w = mount(PbImage, { props: base, attrs: { class: 'pcard__shot', 'data-x': '1' } });
    const img = w.get('img');
    expect(img.classes()).toContain('pcard__shot');
    expect(img.attributes('data-x')).toBe('1');
  });
});
