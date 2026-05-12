<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ThemeToggle from './ThemeToggle.vue';
import LangSwitch from './LangSwitch.vue';

type Locale = 'en' | 'it' | 'es';

interface NavLink {
  href: string;
  num: string;
  label: string;
  active?: boolean;
}

/** Pull the bare section id out of a nav href like `/it/#about` → `about`. */
function targetIdFromHref(href: string): string {
  const hash = href.indexOf('#');
  return hash === -1 ? '' : href.slice(hash + 1);
}

/** Pre-optimized logo asset (resolved by astro:assets in the layout). */
interface LogoAsset {
  src: string;
  width: number;
  height: number;
}

const props = withDefaults(
  defineProps<{
    lang: Locale;
    basePath?: string;
    links: NavLink[];
    homeHref: string;
    hireHref: string;
    logo: LogoAsset;
    messages: {
      home: string;
      hireMe: string;
      mainNav: string;
      statusAvailable: string;
      statusLocation: string;
      openMenu: string;
      closeMenu: string;
      toLight: string;
      toDark: string;
      language: string;
    };
  }>(),
  { basePath: '/' },
);

const open = ref(false);
const scrolled = ref(false);

// ── Active section tracking (click + scroll-spy) ───────────────────────
/** Section ids derived from the nav links, in document order. */
const sectionIds = computed(() =>
  props.links.map((l) => targetIdFromHref(l.href)).filter((id): id is string => !!id),
);
const activeId = ref<string>(
  props.links.find((l) => l.active) ? targetIdFromHref(props.links.find((l) => l.active)!.href) : '',
);

/** Links with their derived target id, for `:class` comparisons in the template. */
const navItems = computed(() =>
  props.links.map((l) => ({ ...l, targetId: targetIdFromHref(l.href) })),
);

/** Which section ids are currently crossing the "active band" near the top. */
const inBand = new Set<string>();

function recomputeActive() {
  // Pick the last section (document order) intersecting the band — i.e. the one
  // you've most recently scrolled into.
  let best: string | null = null;
  for (const id of sectionIds.value) {
    if (inBand.has(id)) best = id;
  }
  if (best && best !== activeId.value) activeId.value = best;
}

let observer: IntersectionObserver | null = null;

function setActiveFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash && sectionIds.value.includes(hash)) {
    activeId.value = hash;
  } else if (!activeId.value && sectionIds.value.length) {
    activeId.value = sectionIds.value[0];
  }
}

function onLinkClick(href: string) {
  const id = targetIdFromHref(href);
  if (id) activeId.value = id;
  open.value = false;
  // CSS `scroll-behavior: smooth` handles the actual scroll — don't preventDefault.
}

function onScroll() {
  scrolled.value = window.scrollY > 4;
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) open.value = false;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('hashchange', setActiveFromHash);
  onScroll();
  setActiveFromHash();

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        recomputeActive();
      },
      // Shrink the viewport to a thin band ~25% from the top: the "active"
      // section is whichever one currently sits under that line.
      { rootMargin: '-25% 0px -70% 0px', threshold: 0 },
    );
    for (const id of sectionIds.value) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
  }
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('hashchange', setActiveFromHash);
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div
    class="nav-root"
    :class="{ 'is-scrolled': scrolled }"
  >
    <!-- Status strip -->
    <div class="nav-status">
      <span>
        <span
          class="nav-status__dot"
          aria-hidden="true"
        />
        {{ messages.statusAvailable }}
      </span>
      <span>{{ messages.statusLocation }}</span>
    </div>

    <nav
      class="nav-bar"
      :aria-label="messages.mainNav"
    >
      <!-- Wordmark -->
      <a
        :href="homeHref"
        :aria-label="messages.home"
        class="nav-mark"
      >
        <img
          class="nav-mark__img"
          :src="logo.src"
          :width="logo.width"
          :height="logo.height"
          alt=""
          loading="eager"
          decoding="async"
          fetchpriority="high"
        >
        <span class="nav-wordmark">Micio<span class="nav-wordmark__dev">Dev</span></span>
      </a>

      <!-- Desktop links -->
      <ul class="nav-links">
        <li
          v-for="l in navItems"
          :key="l.href"
        >
          <a
            :href="l.href"
            class="nav-link"
            :class="{ 'is-active': l.targetId === activeId }"
            :aria-current="l.targetId === activeId ? 'page' : undefined"
            @click="onLinkClick(l.href)"
          >
            <span class="nav-link__num">{{ l.num }}</span>
            <span>{{ l.label }}</span>
          </a>
        </li>
      </ul>

      <!-- Desktop controls -->
      <div class="nav-controls">
        <LangSwitch
          :current="lang"
          :base-path="basePath"
          :label="messages.language"
        />
        <span
          class="nav-divider"
          aria-hidden="true"
        />
        <ThemeToggle
          :label-to-light="messages.toLight"
          :label-to-dark="messages.toDark"
        />
        <a
          :href="hireHref"
          class="md-btn nav-cta"
        >
          {{ messages.hireMe }} <span class="arrow">→</span>
        </a>
      </div>

      <!-- Mobile hamburger -->
      <button
        type="button"
        class="nav-burger"
        :aria-label="open ? messages.closeMenu : messages.openMenu"
        :aria-expanded="open"
        @click="open = !open"
      >
        <svg
          v-if="open"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 3l10 10M13 3 3 13"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
        <span
          v-else
          class="nav-burger__lines"
          aria-hidden="true"
        >
          <span style="width: 16px" />
          <span style="width: 11px; margin-left: 5px" />
        </span>
      </button>
    </nav>

    <!-- Mobile drawer -->
    <div
      v-show="open"
      class="nav-drawer"
    >
      <hr class="md-hr">
      <ul class="nav-drawer__links">
        <li
          v-for="l in navItems"
          :key="l.href"
        >
          <a
            :href="l.href"
            :aria-current="l.targetId === activeId ? 'page' : undefined"
            class="nav-drawer__link"
            :class="{ 'is-active': l.targetId === activeId }"
            @click="onLinkClick(l.href)"
          >
            <span>
              <span class="nav-drawer__num">{{ l.num }}</span>
              {{ l.label }}
            </span>
            <span
              class="nav-drawer__arrow"
              aria-hidden="true"
            >↗</span>
          </a>
        </li>
      </ul>
      <div class="nav-drawer__controls">
        <LangSwitch
          :current="lang"
          :base-path="basePath"
          :label="messages.language"
          size="sm"
        />
        <ThemeToggle
          :label-to-light="messages.toLight"
          :label-to-dark="messages.toDark"
        />
      </div>
      <a
        :href="hireHref"
        class="md-btn nav-drawer__cta"
      >
        {{ messages.hireMe }} <span class="arrow">→</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.nav-root {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--bg) 88%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-2) var(--ease);
}
.nav-root.is-scrolled {
  border-bottom-color: var(--line);
}

.nav-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 22px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.nav-status__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand);
  margin-right: 8px;
  vertical-align: 1px;
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 25%, transparent);
}

.nav-bar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 16px 22px;
}
@media (min-width: 960px) {
  .nav-bar { padding: 18px 32px; }
}

.nav-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
}
.nav-mark__img {
  width: 30px;
  height: 30px;
  border-radius: var(--r-2);
  object-fit: cover;
  flex: none;
}
.nav-wordmark {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 24px;
  line-height: 1;
  letter-spacing: -0.01em;
}
.nav-wordmark__dev {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.04em;
}

.nav-links {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 28px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 4px;
  color: var(--text-2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.nav-link.is-active { color: var(--text); }
.nav-link.is-active::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: 2px;
  height: 1px;
  background: var(--brand);
}
.nav-link__num {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: 0.12em;
}

.nav-controls {
  display: none;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--line);
}
.nav-cta { height: 36px; padding: 0 16px; }

.nav-burger {
  justify-self: end;
  width: 36px;
  height: 36px;
  border-radius: var(--r-2);
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav-burger__lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-burger__lines span {
  height: 1.5px;
  background: currentColor;
}

.nav-drawer {
  padding: 4px 22px 22px;
  display: grid;
  gap: 4px;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}
.nav-drawer__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
}
.nav-drawer__link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 28px;
  line-height: 1;
  color: var(--text-2);
  text-decoration: none;
}
.nav-drawer__link.is-active { color: var(--text); }
.nav-drawer__link > span:first-child {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.nav-drawer__num {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.12em;
}
.nav-drawer__arrow {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 12px;
  color: var(--text-3);
}
.nav-drawer__link.is-active .nav-drawer__arrow { color: var(--brand); }
.nav-drawer__controls {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-drawer__cta {
  margin-top: 14px;
  justify-content: center;
}

@media (min-width: 960px) {
  .nav-links { display: flex; }
  .nav-controls { display: flex; }
  .nav-burger { display: none; }
  .nav-drawer { display: none !important; }
}
</style>
