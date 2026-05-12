/// <reference path="../pb_data/types.d.ts" />

// Drops the `colophon.repoCta` / `colophon.repoUrl` rows from the `translations`
// collection. An earlier draft of the home-page colophon section had a "view the
// source ↗" link to a repo, but that repo (itjobhub-antigravity-config) is the
// DevBoards.io project's repo, not this portfolio's — and the portfolio's own
// repo isn't public — so the link was removed and the keys with it. `1778607000`
// no longer seeds these keys, so on a fresh DB this migration is a no-op; on an
// already-migrated instance it deletes the orphan rows. Idempotent.

migrate(
  (app) => {
    const keys = ['colophon.repoCta', 'colophon.repoUrl'];
    for (const key of keys) {
      try {
        const rec = app.findFirstRecordByFilter('translations', 'key = {:key}', { key });
        app.delete(rec);
      } catch (_) {
        // already absent — nothing to do
      }
    }
  },
  (app) => {
    // No-op rollback — re-adding a "view the source" link is a deliberate
    // content decision, not something to bring back automatically.
  },
);
