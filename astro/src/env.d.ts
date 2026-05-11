/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Public PocketBase base URL, e.g. https://pb.micio86dev.it. Read at runtime
   *  (process.env) on the SSR server and exposed to the browser for the contact
   *  form; falls back to http://localhost:8090. */
  readonly PUBLIC_PB_URL?: string;
  /** Canonical site origin (build-time, read by astro.config.mjs). */
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
