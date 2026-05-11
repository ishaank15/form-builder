/**
 * Templates service — CRUD over FormDefinition records, persisted as one keyed dict.
 *
 * Why one dict (not key-per-template): for the take-home's scale this is cheaper to read
 * (single localStorage hit on dashboard load), atomic to write per save, and avoids the
 * "list keys" pattern that's awkward with localStorage. If forms become large or numerous
 * we swap the adapter for IndexedDB without changing this service's surface.
 */
import { persistence, STORAGE_KEYS } from '@/platform/persistence';
import { parseFormDefinition } from '@/domain/form/schema';
import type { FormDefinition } from '@/domain/form/types';
import type { TemplateId } from '@/domain/id';

type Dict = Record<string, FormDefinition>;

const readAll = (): Dict => {
  const raw = persistence.read(STORAGE_KEYS.templates);
  if (raw === null || typeof raw !== 'object') return {};
  const out: Dict = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    try {
      out[id] = parseFormDefinition(value);
    } catch {
      // Skip malformed entries rather than failing the whole list.
      if (typeof console !== 'undefined') {
        console.warn('[templates] skipping malformed entry', id);
      }
    }
  }
  return out;
};

const writeAll = (dict: Dict): void => {
  persistence.write(STORAGE_KEYS.templates, dict);
};

export const templatesService = {
  list(): ReadonlyArray<FormDefinition> {
    return Object.values(readAll()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  },

  get(id: TemplateId): FormDefinition | null {
    return readAll()[id] ?? null;
  },

  save(form: FormDefinition): FormDefinition {
    const all = readAll();
    all[form.id] = form;
    writeAll(all);
    return form;
  },

  remove(id: TemplateId): void {
    const all = readAll();
    delete all[id];
    writeAll(all);
  },
};
