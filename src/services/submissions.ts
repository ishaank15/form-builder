/**
 * Submissions service — append-only archive keyed by SubmissionId.
 *
 * Submissions are immutable. The service exposes save/list/get/byTemplate but no update.
 * Each record carries `templateVersion` so older submissions remain renderable even if
 * the underlying template has since changed.
 */
import { persistence, STORAGE_KEYS } from '@/platform/persistence';
import { parseSubmission } from '@/domain/submission/schema';
import type { Submission } from '@/domain/submission/types';
import type { SubmissionId, TemplateId } from '@/domain/id';

type Dict = Record<string, Submission>;

const readAll = (): Dict => {
  const raw = persistence.read(STORAGE_KEYS.submissions);
  if (raw === null || typeof raw !== 'object') return {};
  const out: Dict = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    try {
      out[id] = parseSubmission(value);
    } catch {
      if (typeof console !== 'undefined') {
        console.warn('[submissions] skipping malformed entry', id);
      }
    }
  }
  return out;
};

const writeAll = (dict: Dict): void => {
  persistence.write(STORAGE_KEYS.submissions, dict);
};

export const submissionsService = {
  list(): ReadonlyArray<Submission> {
    return Object.values(readAll()).sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
  },

  byTemplate(templateId: TemplateId): ReadonlyArray<Submission> {
    return submissionsService.list().filter((s) => s.templateId === templateId);
  },

  get(id: SubmissionId): Submission | null {
    return readAll()[id] ?? null;
  },

  save(submission: Submission): Submission {
    const all = readAll();
    all[submission.id] = submission;
    writeAll(all);
    return submission;
  },
};
