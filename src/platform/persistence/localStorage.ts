/**
 * Browser localStorage implementation of PersistenceAdapter.
 *
 * Wraps every value in a versioned envelope and runs the migration chain on read.
 * Catches QuotaExceeded errors and re-throws as a structured error the UI can surface.
 *
 * In-memory shim: we don't reach into globalThis at module-eval time so SSR and Node
 * test runners can use this with a polyfill (vitest's jsdom environment provides one).
 */
import type { PersistenceAdapter } from './adapter';
import { STORAGE_NAMESPACE, STORAGE_SCHEMA_VERSION, fullKey } from './constants';
import { migratePayload } from './migrations';
import { unwrapEnvelope, wrapEnvelope } from './envelope';

export class StorageQuotaError extends Error {
  constructor(message = 'localStorage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export interface LocalStoragePersistenceAdapterOptions {
  /** Override for tests / SSR. Defaults to globalThis.localStorage. */
  readonly storage?: Storage;
}

export const createLocalStoragePersistenceAdapter = (
  options: LocalStoragePersistenceAdapterOptions = {},
): PersistenceAdapter => {
  const getStorage = (): Storage => {
    const s = options.storage ?? (globalThis as { localStorage?: Storage }).localStorage;
    if (!s) throw new Error('No localStorage available in this environment');
    return s;
  };

  return {
    read(key) {
      const raw = getStorage().getItem(fullKey(key));
      if (raw === null) return null;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        if (typeof console !== 'undefined') {
          console.warn('[persistence] non-JSON value at key', key);
        }
        return null;
      }
      const envelope = unwrapEnvelope(parsed);
      if (!envelope) return null;
      try {
        return migratePayload(
          envelope.payload,
          envelope.payloadVersion,
          STORAGE_SCHEMA_VERSION,
        );
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[persistence] migration failed for key', key, err);
        }
        return null;
      }
    },

    write(key, value) {
      const wrapped = wrapEnvelope(value, STORAGE_SCHEMA_VERSION);
      const serialized = JSON.stringify(wrapped);
      try {
        getStorage().setItem(fullKey(key), serialized);
      } catch (err) {
        // Quota / SecurityError. Re-throw with a stable type for the UI.
        if (err instanceof Error && /quota|exceed/i.test(err.message)) {
          throw new StorageQuotaError(err.message);
        }
        throw err;
      }
    },

    remove(key) {
      getStorage().removeItem(fullKey(key));
    },

    clearNamespace() {
      const s = getStorage();
      const prefix = `${STORAGE_NAMESPACE}:`;
      const toRemove: string[] = [];
      for (let i = 0; i < s.length; i += 1) {
        const k = s.key(i);
        if (k && k.startsWith(prefix)) toRemove.push(k);
      }
      for (const k of toRemove) s.removeItem(k);
    },
  };
};
