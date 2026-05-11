/**
 * Tiny class-name joiner. Filters out falsy values, joins with spaces.
 * No dependency on tailwind-merge to keep `shared/` truly dependency-free.
 */
export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');
