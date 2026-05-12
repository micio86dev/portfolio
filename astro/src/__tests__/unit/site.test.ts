import { describe, it, expect } from 'vitest';
import { CONTACT_EMAIL } from '../../lib/site';

describe('CONTACT_EMAIL', () => {
  it('falls back to the literal default when no env var is set', () => {
    // The test runner sets neither process.env.PUBLIC_CONTACT_EMAIL nor the
    // import.meta.env counterpart, so the bundled default applies.
    expect(CONTACT_EMAIL).toBe('micio86dev@gmail.com');
  });
});
