/**
 * Submission types — the immutable archive of a completed form fill.
 *
 * Two views, two purposes:
 *   FormState  : mutable, in-store, held during fill mode
 *   Submission : immutable, persisted, frozen view at submit time
 *
 * Hidden fields (per the conditions engine at submit time) are excluded from `Submission.values`.
 * That policy is enforced in the submission *builder* (see ./builder.ts), not in the UI —
 * so PDF export, list view, and re-export all see the same shape.
 */
import type { FieldId, SubmissionId, TemplateId } from '@/domain/id';
import type { FormSchemaVersion } from '@/domain/form/types';

export interface FormState {
  readonly values: Readonly<Record<string, unknown>>; // keyed by FieldId
  readonly touched: Readonly<Record<string, boolean>>;
}

export interface Submission {
  readonly id: SubmissionId;
  readonly templateId: TemplateId;
  /** Pin the template version used so older submissions remain renderable after edits. */
  readonly templateVersion: number;
  readonly schemaVersion: FormSchemaVersion;
  readonly submittedAt: string;
  readonly values: Readonly<Record<string, unknown>>;
}

/** Helper for accessing typed values without losing the FieldId brand at the call site. */
export const valueAt = (state: FormState | Submission, fieldId: FieldId): unknown =>
  state.values[fieldId];
