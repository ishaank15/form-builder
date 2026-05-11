/**
 * Conditions evaluator — pure.
 *
 * Given (form, values), produces:
 *   - visibility: Map<FieldId, boolean>
 *   - required:   Map<FieldId, boolean>
 *
 * Policy ("last-active-condition-wins"): for each field, start with its default state.
 * Iterate the field's conditions in declaration order. For each condition whose predicate
 * is currently true, apply that condition's effect to the relevant axis (visibility or
 * requirement). The last matching condition wins.
 *
 * Hidden-target read policy: condition predicates read `values[targetFieldId]` directly,
 * regardless of the target's visibility. See ADR 0001.
 */
import type { FormDefinition, AnyFieldDefinition } from '@/domain/form/types';
import type { FieldId } from '@/domain/id';
import type { Condition } from '@/domain/condition/types';
import { getOperator } from './operators';

export interface ConditionsResult {
  readonly visibility: ReadonlyMap<FieldId, boolean>;
  readonly required: ReadonlyMap<FieldId, boolean>;
}

const matches = (cond: Condition, values: Readonly<Record<string, unknown>>): boolean => {
  const op = getOperator(cond.operator);
  return op.evaluate(values[cond.targetFieldId], cond.value);
};

const evalVisibility = (
  field: AnyFieldDefinition,
  values: Readonly<Record<string, unknown>>,
): boolean => {
  let visible = field.defaultVisibility === 'visible';
  for (const cond of field.conditions) {
    if (cond.effect !== 'show' && cond.effect !== 'hide') continue;
    if (matches(cond, values)) visible = cond.effect === 'show';
  }
  return visible;
};

const evalRequired = (
  field: AnyFieldDefinition,
  values: Readonly<Record<string, unknown>>,
): boolean => {
  let required = field.defaultRequired;
  for (const cond of field.conditions) {
    if (cond.effect !== 'markRequired' && cond.effect !== 'markNotRequired') continue;
    if (matches(cond, values)) required = cond.effect === 'markRequired';
  }
  return required;
};

export const evaluateConditions = (
  form: FormDefinition,
  values: Readonly<Record<string, unknown>>,
): ConditionsResult => {
  const visibility = new Map<FieldId, boolean>();
  const required = new Map<FieldId, boolean>();
  for (const field of form.fields) {
    visibility.set(field.id, evalVisibility(field, values));
    required.set(field.id, evalRequired(field, values));
  }
  return { visibility, required };
};
