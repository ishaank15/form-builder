/**
 * Persistence layer — public surface.
 *
 * Exposes the adapter interface, the localStorage implementation factory, and a singleton
 * `persistence` for application code that doesn't need to inject its own storage. Tests
 * construct their own adapter against a fresh storage shim.
 */
import { createLocalStoragePersistenceAdapter } from './localStorage';
export type { PersistenceAdapter } from './adapter';
export {
  createLocalStoragePersistenceAdapter,
  StorageQuotaError,
} from './localStorage';
export {
  STORAGE_KEYS,
  STORAGE_SCHEMA_VERSION,
  STORAGE_NAMESPACE,
  type StorageKey,
} from './constants';

/** Application-default adapter. Tests should construct their own. */
export const persistence = createLocalStoragePersistenceAdapter();
