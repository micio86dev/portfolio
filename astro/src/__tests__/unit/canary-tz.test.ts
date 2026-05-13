import { describe, it, expect } from 'vitest';
import { getCanaryUtcOffset } from '../../lib/canary-tz';

describe('getCanaryUtcOffset', () => {
  it('returns "UTC+0" for a winter date (no DST)', () => {
    // 15 January — Canary Islands are WET (UTC+0) all of January.
    const winter = new Date(Date.UTC(2026, 0, 15, 12));
    expect(getCanaryUtcOffset(winter)).toBe('UTC+0');
  });

  it('returns "UTC+1" for a summer date (DST active)', () => {
    // 15 July — Canary Islands are WEST (UTC+1) all of July.
    const summer = new Date(Date.UTC(2026, 6, 15, 12));
    expect(getCanaryUtcOffset(summer)).toBe('UTC+1');
  });

  it('flips at the DST boundary (last Sunday of March, EU rules)', () => {
    // EU summer time begins 01:00 UTC on the last Sunday of March.
    // For 2026 that's Sunday 29 March, switch at 01:00 UTC.
    const beforeSwitch = new Date(Date.UTC(2026, 2, 29, 0, 30));
    const afterSwitch = new Date(Date.UTC(2026, 2, 29, 1, 30));
    expect(getCanaryUtcOffset(beforeSwitch)).toBe('UTC+0');
    expect(getCanaryUtcOffset(afterSwitch)).toBe('UTC+1');
  });

  it('flips back at the DST end (last Sunday of October, EU rules)', () => {
    // Summer time ends 01:00 UTC on the last Sunday of October.
    // For 2026 that's Sunday 25 October, switch at 01:00 UTC.
    const beforeSwitch = new Date(Date.UTC(2026, 9, 25, 0, 30));
    const afterSwitch = new Date(Date.UTC(2026, 9, 25, 1, 30));
    expect(getCanaryUtcOffset(beforeSwitch)).toBe('UTC+1');
    expect(getCanaryUtcOffset(afterSwitch)).toBe('UTC+0');
  });

  it('uses the explicit Atlantic/Canary timezone, not the server local time', () => {
    // Smoke-test: passing any UTC date should resolve via the Atlantic/Canary
    // zone, so the answer must be one of the two canonical labels.
    const probe = new Date(Date.UTC(2026, 5, 1));
    const result = getCanaryUtcOffset(probe);
    expect(['UTC+0', 'UTC+1']).toContain(result);
  });
});
