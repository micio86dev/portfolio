<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const STORAGE_KEY = 'miciodev-theme';

withDefaults(
  defineProps<{
    /** label when currently dark (→ action: switch to light) */
    labelToLight?: string;
    /** label when currently light (→ action: switch to dark) */
    labelToDark?: string;
    /** visual size in px (square) */
    size?: number;
  }>(),
  { labelToLight: 'Switch to light mode', labelToDark: 'Switch to dark mode', size: 32 },
);

const dark = ref(false);
let mql: MediaQueryList | null = null;

function applyTheme(next: 'light' | 'dark') {
  dark.value = next === 'dark';
  document.documentElement.dataset.theme = next;
}

function toggle() {
  const next = dark.value ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage may be unavailable (private mode) — toggle still works for the session */
  }
}

function onSystemChange(e: MediaQueryListEvent) {
  // Only follow the OS when the user hasn't made a manual choice.
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  if (!saved) applyTheme(e.matches ? 'dark' : 'light');
}

onMounted(() => {
  // The blocking bootstrap script in <head> already set data-theme; sync from it.
  dark.value = document.documentElement.dataset.theme === 'dark';
  mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', onSystemChange);
});

onBeforeUnmount(() => {
  mql?.removeEventListener('change', onSystemChange);
});
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="dark ? labelToLight : labelToDark"
    :aria-pressed="dark"
    :style="{ width: size + 'px', height: size + 'px' }"
    @click="toggle"
  >
    <!-- moon when dark, sun when light -->
    <svg
      v-if="dark"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.5 9.5A5 5 0 1 1 6.5 2.5a5.5 5.5 0 0 0 7 7Z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
    </svg>
    <svg
      v-else
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="3"
        stroke="currentColor"
        stroke-width="1.4"
      />
      <line
        v-for="a in [0, 45, 90, 135, 180, 225, 270, 315]"
        :key="a"
        :x1="8 + Math.cos((a * Math.PI) / 180) * 5.4"
        :y1="8 + Math.sin((a * Math.PI) / 180) * 5.4"
        :x2="8 + Math.cos((a * Math.PI) / 180) * 7"
        :y2="8 + Math.sin((a * Math.PI) / 180) * 7"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: border-color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
}
.theme-toggle:hover {
  border-color: var(--text);
}
</style>
