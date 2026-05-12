<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Slim, non-blocking cookie/privacy notice.
 *
 * This site stores exactly ONE thing client-side: the `miciodev-theme`
 * localStorage key (light/dark preference) — a strictly-necessary functional
 * setting that does NOT require consent under GDPR/ePrivacy. There is no
 * analytics, no tracking, no third-party cookies. So this bar is a *notice*,
 * not a consent wall: no backdrop, no scroll-lock, no fake "Reject"/"Customize".
 * It only discloses + lets you acknowledge it.
 */

const STORAGE_KEY = 'miciodev-cookie-ack';
const ACK_VERSION = 1; // bump to re-prompt after a material policy change
const REOPEN_EVENT = 'miciodev:cookie-reopen';

interface CookieMessages {
  text: string;
  accept: string;
  privacyLink: string;
  ariaLabel: string;
}

/** Single, always-on, non-toggleable storage category. Kept here so a future
 *  policy change can extend it without reshaping the dismiss handler. */
const categories = [{ id: 'necessary', required: true, enabled: true }] as const;

defineProps<{
  messages: CookieMessages;
  /** Locale-prefixed href for the privacy page, computed in Astro. */
  privacyHref: string;
}>();

const visible = ref(false);
const reducedMotion = ref(false);

function safeRead(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { v?: number; ack?: boolean };
    return parsed?.ack === true && parsed?.v === ACK_VERSION;
  } catch {
    // localStorage unavailable or malformed value — treat as not acknowledged.
    return false;
  }
}

/** Accepts an optional consent object for forward-compatibility; today it's
 *  always the single `necessary` category. */
function dismiss(_consent: ReadonlyArray<{ id: string; enabled: boolean }> = categories): void {
  visible.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: ACK_VERSION, ack: true, ts: Date.now() }));
  } catch {
    // Storage blocked (e.g. private mode) — dismissing for the session is a
    // no-op persistence-wise; the bar simply reappears on the next visit.
  }
}

function reopen(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  visible.value = true;
}

/** The footer "Cookie settings" link is plain SSR HTML (`#cookie-settings`);
 *  wire it up here so JS stays minimal and the link degrades to /privacy. */
function onSettingsClick(e: Event): void {
  e.preventDefault();
  reopen();
}

let settingsLink: HTMLElement | null = null;

onMounted(() => {
  reducedMotion.value =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  visible.value = !safeRead();

  window.addEventListener(REOPEN_EVENT, reopen);
  settingsLink = document.getElementById('cookie-settings');
  settingsLink?.addEventListener('click', onSettingsClick);
});

onBeforeUnmount(() => {
  window.removeEventListener(REOPEN_EVENT, reopen);
  settingsLink?.removeEventListener('click', onSettingsClick);
});
</script>

<template>
  <Transition :name="reducedMotion ? '' : 'cookiebar'">
    <aside
      v-if="visible"
      class="cookiebar"
      role="region"
      :aria-label="messages.ariaLabel"
    >
      <p class="cookiebar__text">
        {{ messages.text }}
      </p>
      <div class="cookiebar__actions">
        <a
          class="cookiebar__link"
          :href="privacyHref"
        >{{ messages.privacyLink }}</a>
        <button
          type="button"
          class="md-btn cookiebar__ok"
          @click="dismiss()"
        >
          {{ messages.accept }}
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.cookiebar {
  position: fixed;
  inset: auto 0 0 0;
  /* Above page content; just under the sticky nav / mobile drawer (z-index: 50)
     so the menu always wins, but the bar stays reachable. */
  z-index: 45;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  padding: 12px 22px;
  background: var(--surface);
  border-top: 1px solid var(--line);
  box-shadow: 0 -8px 24px color-mix(in oklab, var(--bg) 60%, transparent);
}
@media (min-width: 960px) {
  .cookiebar { padding: 12px 32px; }
}

.cookiebar__text {
  margin: 0;
  flex: 1 1 280px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-2);
}

.cookiebar__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.cookiebar__link {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--text-2);
  text-decoration: underline;
  text-underline-offset: 3px;
  /* WCAG 2.2 SC 2.5.8 — ≥ 24×24 CSS px pointer target. */
  display: inline-flex;
  align-items: center;
  min-height: 24px;
}
.cookiebar__link:hover { color: var(--text); }
.cookiebar__link:focus-visible {
  outline: none;
  border-radius: var(--r-1);
  box-shadow: var(--shadow-focus);
}

.cookiebar__ok {
  height: 36px;
  padding: 0 18px;
}

/* Comfortable touch target on coarse pointers (≥ 44px tall). */
@media (pointer: coarse) {
  .cookiebar__ok { min-height: 44px; }
  .cookiebar__link { min-height: 44px; }
}

/* Gentle slide-up + fade on first appearance; disabled when the user prefers
   reduced motion (the <Transition> name is also cleared in that case). */
.cookiebar-enter-active,
.cookiebar-leave-active {
  transition: transform var(--dur-2) var(--ease), opacity var(--dur-2) var(--ease);
}
.cookiebar-enter-from,
.cookiebar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .cookiebar-enter-active,
  .cookiebar-leave-active { transition: none; }
}
</style>
