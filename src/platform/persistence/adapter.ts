/**
 * PersistenceAdapter — the seam between services and storage.
 *
 * Defined as an interface so the rest of the app can be tested against an in-memory
 * implementation, and so localStorage can be swapped for IndexedDB later by adding one
 * file.
 *
 * The adapter speaks `unknown` payloads. Domain-shape validation happens above this
 * layer (in `services/`), where we know what we're reading.
 */
import type { StorageKey } from './constants';

export interface PersistenceAdapter {
  read(key: StorageKey): unknown | null;
  write(key: StorageKey, value: unknown): void;
  remove(key: StorageKey): void;
  /** Clear everything in our namespace. Used by tests; never by application code. */
  clearNamespace(): void;
}
