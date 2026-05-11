/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** PocketBase base URL, e.g. https://pb.miciodev.com */
  readonly PB_URL?: string;
  /** Optional PocketBase admin token (only if writing submissions back) */
  readonly PB_ADMIN_TOKEN?: string;
  /** Resend API key */
  readonly RESEND_API_KEY?: string;
  /** Destination address for contact-form submissions */
  readonly CONTACT_TO_EMAIL?: string;
  /** Verified sender, e.g. "MicioDev <hello@miciodev.com>" */
  readonly CONTACT_FROM_EMAIL?: string;
  /** Canonical site origin */
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
