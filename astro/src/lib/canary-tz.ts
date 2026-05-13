/**
 * Canary Islands UTC offset, computed at request time.
 *
 * The Canary Islands observe WET/WEST: UTC+0 in winter, UTC+1 during daylight
 * saving (last Sunday of March → last Sunday of October, EU rules). The site
 * surfaces the offset in two places (`Hero` status strip and `Contact`
 * aside); both used to ship a hard-coded "UTC+0" string, which silently
 * lied half the year.
 *
 * We delegate to `Intl.DateTimeFormat` with an explicit `Atlantic/Canary`
 * time zone, so the result is correct regardless of where the request is
 * served from (our VPS lives in Europe but could be relocated; Lighthouse
 * hits us from yet another place). The short-offset format Chrome and
 * Node both return is `GMT` / `GMT+1`; we re-spell that as `UTC+0` /
 * `UTC+1` to match the prior on-page label.
 */
export function getCanaryUtcOffset(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Atlantic/Canary',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  // Examples: "GMT" → "UTC+0"; "GMT+1" → "UTC+1".
  if (tz === 'GMT') return 'UTC+0';
  return tz.replace(/^GMT/, 'UTC');
}
