/// <reference path="../pb_data/types.d.ts" />

// Strips the hard-coded "· UTC+0" suffix from the `status.location` and
// `contact.aside.timezone` translation rows. The site moved to a runtime
// `getCanaryUtcOffset()` helper that appends the live `UTC+0` / `UTC+1`
// based on whether Canary Islands DST is in effect; the PB overlay was
// still carrying the legacy static suffix, which produced a double label
// at render time ("Fuerteventura · Canary Islands · UTC+0 · UTC+1" during
// DST). Stripping the static suffix once leaves only the location body
// and lets the renderer own the timezone segment.
//
// Idempotent: re-running it on already-stripped rows is a no-op. The
// down() restores the original strings exactly.

const STRIPPED = {
  'status.location': {
    en: 'Fuerteventura · Canary Islands',
    it: 'Fuerteventura · Isole Canarie',
    es: 'Fuerteventura · Islas Canarias',
  },
  'contact.aside.timezone': {
    en: 'Fuerteventura',
    it: 'Fuerteventura',
    es: 'Fuerteventura',
  },
};

const WITH_UTC = {
  'status.location': {
    en: 'Fuerteventura · Canary Islands · UTC+0',
    it: 'Fuerteventura · Isole Canarie · UTC+0',
    es: 'Fuerteventura · Islas Canarias · UTC+0',
  },
  'contact.aside.timezone': {
    en: 'Fuerteventura · UTC+0',
    it: 'Fuerteventura · UTC+0',
    es: 'Fuerteventura · UTC+0',
  },
};

migrate(
  (app) => {
    for (const key of Object.keys(STRIPPED)) {
      try {
        const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key });
        const next = STRIPPED[key];
        rec.set('en', next.en);
        rec.set('it', next.it);
        rec.set('es', next.es);
        app.save(rec);
      } catch (_) {
        // Row absent on a fresh DB — bundled JSON already has the stripped
        // values, so nothing to do.
      }
    }
  },
  (app) => {
    for (const key of Object.keys(WITH_UTC)) {
      try {
        const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key });
        const prev = WITH_UTC[key];
        rec.set('en', prev.en);
        rec.set('it', prev.it);
        rec.set('es', prev.es);
        app.save(rec);
      } catch (_) {
        /* row absent — nothing to rewind */
      }
    }
  },
);
