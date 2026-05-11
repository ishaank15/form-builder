/**
 * Validation runner — pure.
 *
 * Composes three sources of truth:
 *   1. Plugin's `valueSchema(config)` for per-type rules (min/max length, range, etc.)
 *   2. Required-state map from the conditions engine
 *   3. Visibility map from the conditions engine — hidden fields are NOT validated
 *
 * Returns a Map<FieldId, string> of error messages, plus an `ok` flag. The filler UI
 * shows messages inline next to the relevant field; the submit handler short-circuits
 * if `ok === false`.
 *
 * Spec rule honored here: "A hidden field must never be validated as required, even if
 * it is marked required." Hidden fields are skipped wholesale, not just for required.
 */
import type { FormDefinition } from '@/domain/form/types';
import type { FieldId } from '@/domain/id';
import type { ConditionsResult } from '../conditions';
import { isEmpty } from '../conditions';
import { getPlugin, isKnownKind } from '@/platform/field-registry';

export interface ValidationResult {
  readonly errors: ReadonlyMap<FieldId, string>;
  readonly ok: boolean;
}

const REQUIRED_MESSAGE = 'This field is required.';

export const validateValues = (
  form: FormDefinition,
  values: Readonly<Record<string, unknown>>,
  conditions: ConditionsResult,
): ValidationResult => {
  const errors = new Map<FieldId, string>();
  for (const field of form.fields) {
    // Hidden fields: not validated at all (per spec).
    if (conditions.visibility.get(field.id) === false) continue;
    // Non-input fields: nothing to validate.
    if (!isKnownKind(field.kind)) continue;
    const plugin = getPlugin(field.kind);
    if (!plugin.capturesValue) continue;

    const required = conditions.required.get(field.id) ?? field.defaultRequired;
    const value = values[field.id];

    if (isEmpty(value)) {
      if (required) errors.set(field.id, REQUIRED_MESSAGE);
      continue;
    }

    // Per-plugin schema check
    const schema = plugin.valueSchema(field.config as never);
    const r = schema.safeParse(value);
    if (!r.success) {
      const firstIssue = r.error.issues[0];
      errors.set(field.id, firstIssue?.message ?? 'Invalid value');
    }
  }
  return { errors, ok: errors.size === 0 };
};
