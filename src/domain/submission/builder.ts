/**
 * The single, only path from a FormState to a Submission.
 *
 * Responsibilities:
 *   1. Drop values for fields that are NOT visible per the engine's visibility map.
 *   2. Stamp the submission with template id, template version, schema version, timestamp.
 *
 * This function is L1-pure. It takes the visibility map as input — the conditions engine
 * (L2) computes it. We don't import the engine here, keeping domain dependency-free.
 */
import { SubmissionId } from '@/domain/id';
import type { FieldId, SubmissionId as SubmissionIdT } from '@/domain/id';
import type { FormDefinition } from '@/domain/form/types';
import type { FormState, Submission } from './types';

export interface BuildSubmissionInput {
  readonly form: FormDefinition;
  readonly state: FormState;
  /** Map<FieldId, true=visible, false=hidden>. Computed by the conditions engine. */
  readonly visibility: ReadonlyMap<FieldId, boolean>;
  /** Optional ID injection for tests; production uses the default factory. */
  readonly id?: SubmissionIdT;
  readonly submittedAt?: string;
}

export const buildSubmission = (input: BuildSubmissionInput): Submission => {
  const { form, state, visibility } = input;
  const values: Record<string, unknown> = {};
  for (const field of form.fields) {
    const isVisible = visibility.get(field.id) ?? true;
    if (!isVisible) continue; // hidden → excluded
    if (field.kind === 'section') continue; // non-input
    if (Object.hasOwn(state.values, field.id)) {
      values[field.id] = state.values[field.id];
    }
  }
  return {
    id: input.id ?? SubmissionId(),
    templateId: form.id,
    templateVersion: form.version,
    schemaVersion: form.schemaVersion,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
    values,
  };
};
