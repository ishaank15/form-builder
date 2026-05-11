/**
 * Storage namespace.
 *
 * Keys are prefixed with `fb:` (form-builder) and the persistence schema version. The
 * envelope inside each value carries its OWN schema version so per-entity migrations
 * don't require global key churn.
 */
export const STORAGE_NAMESPACE = 'fb';
export const STORAGE_SCHEMA_VERSION = 1 as const;
export type StorageSchemaVersion = typeof STORAGE_SCHEMA_VERSION;

export const STORAGE_KEYS = {
  templates: 'templates',
  submissions: 'submissions',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const fullKey = (key: StorageKey): string =>
  `${STORAGE_NAMESPACE}:v${STORAGE_SCHEMA_VERSION}:${key}`;
