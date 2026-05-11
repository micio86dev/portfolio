/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Public PocketBase base URL, e.g. https://pb.micio86dev.it. Read at runtime
   *  (process.env) on the SSR server and exposed to the browser for the contact
   *  form; falls back to http://localhost:8090. */
  readonly PUBLIC_PB_URL?: string;
  /** Public contact email. Read at runtime (process.env) on the SSR server and
   *  inlined into the client bundle for the contact form; falls back to
   *  micio86dev@gmail.com. See src/lib/site.ts. */
  readonly PUBLIC_CONTACT_EMAIL?: string;
  /** Canonical site origin (build-time, read by astro.config.mjs). */
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
