<script setup lang="ts">
import { ref } from 'vue';

type Locale = 'en' | 'it' | 'es';
const LOCALES: Locale[] = ['en', 'it', 'es'];
const DEFAULT_LOCALE: Locale = 'en';
const LABELS: Record<Locale, string> = { en: 'EN', it: 'IT', es: 'ES' };

const props = withDefaults(
  defineProps<{
    /** active locale, passed from the Astro page */
    current: Locale;
    /** current pathname WITHOUT the locale prefix, e.g. "/" or "/projects/foo" */
    basePath?: string;
    /** ARIA group label */
    label?: string;
    /** "default" segmented look, or "dark" for the always-dark footer */
    variant?: 'default' | 'dark';
    size?: 'sm' | 'md';
  }>(),
  { basePath: '/', label: 'Language', variant: 'default', size: 'md' },
);

const buttons = ref<HTMLButtonElement[]>([]);

function hrefFor(locale: Locale): string {
  const clean = props.basePath.startsWith('/') ? props.basePath : `/${props.basePath}`;
  if (locale === DEFAULT_LOCALE) return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${locale}/` : `/${locale}${clean}`;
}

function onKeydown(e: KeyboardEvent, index: number) {
  let next = index;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % LOCALES.length;
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + LOCALES.length) % LOCALES.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = LOCALES.length - 1;
  else return;
  e.preventDefault();
  buttons.value[next]?.focus();
}
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="lang-switch"
    :class="[`lang-switch--${variant}`, `lang-switch--${size}`]"
  >
    <a
      v-for="(loc, i) in LOCALES"
      :key="loc"
      ref="buttons"
      role="radio"
      :href="hrefFor(loc)"
      :aria-checked="loc === current"
      :tabindex="loc === current ? 0 : -1"
      class="lang-switch__opt"
      :class="{ 'is-active': loc === current }"
      @keydown="onKeydown($event, i)"
    >
      {{ LABELS[loc] }}
    </a>
  </div>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  border-radius: 999px;
  padding: 2px;
  border: 1px solid var(--line);
  background: var(--surface);
}
.lang-switch--md { height: 32px; }
.lang-switch--sm { height: 28px; }
.lang-switch--dark {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.14);
}

.lang-switch__opt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-decoration: none;
  color: var(--text-2);
  transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
}
.lang-switch--sm .lang-switch__opt { padding: 0 11px; }
.lang-switch__opt:hover { color: var(--text); }
.lang-switch__opt.is-active {
  background: var(--brand);
  color: var(--on-brand);
}

/* dark variant (footer) */
.lang-switch--dark .lang-switch__opt { color: rgba(255, 255, 255, 0.7); }
.lang-switch--dark .lang-switch__opt:hover { color: #fff; }
.lang-switch--dark .lang-switch__opt.is-active {
  background: var(--brand-glow);
  color: #062014;
}
</style>
