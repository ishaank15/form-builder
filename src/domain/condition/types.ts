/**
 * Conditional logic — flat per-field model.
 *
 * Each field carries a list of conditions. A condition has a target field (whose value drives
 * the predicate), an operator, a comparand value, and an effect that applies to the *containing*
 * field when the predicate is true.
 *
 * Combination policy: when a field has multiple conditions, evaluation is "last-active-wins"
 * within each effect category (visibility vs requirement). Documented in
 * docs/DECISIONS/0001-condition-combination.md and rendered in the README.
 */
import type { FieldId, ConditionId } from '@/domain/id';

/** What the condition does to the field that owns it, when its predicate is true. */
export type ConditionEffect =
  | 'show'
  | 'hide'
  | 'markRequired'
  | 'markNotRequired';

/**
 * Operator IDs are global. Each field-type plugin advertises which operators it supports
 * via `plugin.operators`. The operator implementations live in the operator registry.
 *
 * Mapping per spec:
 *   text/textarea → eq, neq, contains
 *   number        → eq, gt, lt, between
 *   single-select → eq, neq
 *   multi-select  → containsAnyOf, containsAllOf, containsNoneOf
 *   date          → eq, before, after
 */
export type OperatorId =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'gt'
  | 'lt'
  | 'between'
  | 'containsAnyOf'
  | 'containsAllOf'
  | 'containsNoneOf'
  | 'before'
  | 'after';

export interface Condition {
  readonly id: ConditionId;
  readonly targetFieldId: FieldId;
  readonly operator: OperatorId;
  /**
   * Comparand. The shape depends on operator:
   *   eq/neq/contains/gt/lt/before/after → string | number
   *   between                            → [number, number]
   *   containsAnyOf/AllOf/NoneOf         → string[]   (option ids)
   * Optional because `unknown` already admits `undefined`; unary operators (none in spec
   * today, but reserved) do not require a value.
   */
  readonly value?: unknown;
  readonly effect: ConditionEffect;
}
