// Test-only stub for the `astro:middleware` virtual module. Vitest aliases the
// import here (see vitest.config.ts → resolve.alias). `defineMiddleware` ships
// as an identity function so the exported `onRequest` can be invoked directly
// with a fabricated context — the surrounding mock setup lives in
// src/__tests__/unit/middleware.test.ts.
export function defineMiddleware<T>(fn: T): T {
  return fn;
}
