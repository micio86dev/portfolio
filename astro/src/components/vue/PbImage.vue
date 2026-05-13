<script setup lang="ts">
/**
 * PbImage — a thin <img> wrapper for externally-hosted image URLs (PocketBase
 * file URLs) that can't go through `astro:assets` (which only optimizes assets
 * imported at build time, not runtime-resolved remote URLs).
 *
 * `width` and `height` are REQUIRED: they reserve the box so the image never
 * causes layout shift (CLS) once it loads. Pass the intrinsic (or intended
 * display) aspect ratio — CSS can still scale it (`width: 100%; height: auto`).
 *
 * Set `eager` for an above-the-fold / LCP image (it then gets
 * `loading="eager"` + `fetchpriority="high"`); otherwise it lazy-loads.
 *
 * `class` and any extra attributes fall through to the root <img> (Vue's
 * default `inheritAttrs`), so callers can style it freely. Used in `.astro`
 * files WITHOUT a client directive — it has no interactivity, so it server-
 * renders straight to a plain <img>.
 *
 * Note: if these URLs were served via ImageKit you could append a transform
 * query like `?tr=w-800,f-webp,q-80` for on-the-fly resizing/format — not
 * wired in here since ImageKit isn't used.
 */
defineProps<{
  src: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
}>();
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
  >
</template>
