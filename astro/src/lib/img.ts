/**
 * Image-URL helpers for the PocketBase-hosted files.
 *
 * PocketBase can resize images on the fly: appending `?thumb=<spec>` to a file
 * URL returns (and caches) a generated thumbnail. `<spec>` syntax:
 *   - `WxH`   — crop to WxH, centred                (e.g. `100x100`)
 *   - `WxHt`  — crop to WxH, anchored to the top    (e.g. `1024x640t`)
 *   - `WxHb`  — crop to WxH, anchored to the bottom
 *   - `WxHf`  — fit *inside* WxH, no crop (keeps aspect)  (e.g. `128x128f`)
 *   - `0xH` / `Wx0` — set one side, the other scales proportionally
 * The thumbnail keeps the original file's format (PB doesn't transcode), so
 * upload screenshots as WebP/AVIF/JPEG — not PNG — to keep them small.
 * See https://pocketbase.io/docs/files-handling/#protected-files (thumb section).
 */

/**
 * Append a PocketBase `thumb` transform to a file URL. No-op for blanks, for
 * non-http(s) URLs, and for SVGs (PB can't thumbnail vector files — and they're
 * already tiny). Safe to call on any `src` — returns it unchanged if it isn't a
 * resizable remote image.
 */
export function pbThumb(url: string | undefined | null, spec: string): string {
  if (!url || !/^https?:\/\//i.test(url) || /\.svgz?($|\?|#)/i.test(url)) return url ?? '';
  return url + (url.includes('?') ? '&' : '?') + 'thumb=' + spec;
}
