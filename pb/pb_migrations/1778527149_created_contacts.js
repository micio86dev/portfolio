/// <reference path="../pb_data/types.d.ts" />

// `contacts` — public contact-form submissions.
//
// The portfolio's contact form (a Vue island in the Astro frontend) POSTs
// straight to `${PUBLIC_PB_URL}/api/collections/contacts/records` from the
// browser. Submissions land here; the admin reads/marks them in the dashboard
// at `/_/`. No email is sent.
//
// SPAM / RATE LIMITING: PocketBase v0.23+ has built-in rate limiting. In the
// dashboard go to Settings → Rate limits, enable it, and add a rule for
// `POST /api/collections/contacts/records` (e.g. a few requests per minute per
// IP). The form also carries a `website` honeypot field, dropped client-side.
//
// API rules (public repo — keep these strict):
//   listRule   = "@request.auth.id != \"\""   → authed admins only
//   viewRule   = "@request.auth.id != \"\""   → authed admins only
//   createRule = ""                            → public (anyone can submit)
//   updateRule = "@request.auth.id != \"\""   → authed admins only (mark read)
//   deleteRule = "@request.auth.id != \"\""   → authed admins only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'contacts',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        {
          type: 'text',
          name: 'id',
          system: true,
          primaryKey: true,
          required: true,
          min: 15,
          max: 15,
          pattern: '^[a-z0-9]+$',
          autogeneratePattern: '[a-z0-9]{15}',
        },
        { type: 'text', name: 'name', required: true, min: 2, max: 100 },
        { type: 'email', name: 'email', required: true },
        { type: 'text', name: 'subject', required: true, max: 200 },
        { type: 'text', name: 'message', required: true, min: 10, max: 2000 },
        { type: 'bool', name: 'read' },
        { type: 'text', name: 'ip' },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
      ],
      indexes: [],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('contacts');
    return app.delete(collection);
  },
);
