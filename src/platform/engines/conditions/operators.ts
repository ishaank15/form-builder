/**
 * Operator registry — open lookup table from OperatorId → pure evaluator.
 *
 * Adding an operator: write the impl, call registerOperator(). No other code changes.
 *
 * Empty-target policy (per spec): "default state applies when the target field has no value".
 * We implement this by short-circuiting every operator to return `false` when the lhs is
 * empty, so the condition's effect is NOT applied regardless of operator. This keeps the
 * intent local to the operator wrapper rather than scattered through the evaluator.
 */
import type { OperatorId } from '@/domain/condition/types';

/** Shape of comparand the editor should render (decided per operator, not per field). */
export type ComparandKind = 'value' | 'range' | 'list' | 'none';

export interface OperatorImpl {
  readonly id: OperatorId;
  readonly label: string;
  readonly comparandKind: ComparandKind;
  readonly evaluate: (lhs: unknown, rhs: unknown) => boolean;
}

const ops = new Map<OperatorId, OperatorImpl>();

export const registerOperator = (op: OperatorImpl): void => {
  if (ops.has(op.id)) throw new Error(`Operator already registered: ${op.id}`);
  ops.set(op.id, op);
};

export const getOperator = (id: OperatorId): OperatorImpl => {
  const op = ops.get(id);
  if (!op) throw new Error(`Unknown operator: ${id}`);
  return op;
};

export const allOperators = (): ReadonlyArray<OperatorImpl> => [...ops.values()];

export const isEmpty = (v: unknown): boolean =>
  v === undefined ||
  v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

/** Wrap an evaluator so empty-lhs always returns false (condition inactive). */
const guardEmpty =
  (impl: (a: unknown, b: unknown) => boolean) =>
  (lhs: unknown, rhs: unknown): boolean => {
    if (isEmpty(lhs)) return false;
    return impl(lhs, rhs);
  };

const deepEq = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEq(x, b[i]));
  }
  // Primitives that survived Object.is fall back to JSON for objects.
  return JSON.stringify(a) === JSON.stringify(b);
};

const asArray = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null);

/* ---------- Built-in operators ---------- */

registerOperator({
  id: 'eq',
  label: 'equals',
  comparandKind: 'value',
  evaluate: guardEmpty((a, b) => deepEq(a, b)),
});

registerOperator({
  id: 'neq',
  label: 'does not equal',
  comparandKind: 'value',
  evaluate: guardEmpty((a, b) => !deepEq(a, b)),
});

registerOperator({
  id: 'contains',
  label: 'contains',
  comparandKind: 'value',
  evaluate: guardEmpty(
    (a, b) => typeof a === 'string' && typeof b === 'string' && a.includes(b),
  ),
});

registerOperator({
  id: 'gt',
  label: 'is greater than',
  comparandKind: 'value',
  evaluate: guardEmpty((a, b) => typeof a === 'number' && typeof b === 'number' && a > b),
});

registerOperator({
  id: 'lt',
  label: 'is less than',
  comparandKind: 'value',
  evaluate: guardEmpty((a, b) => typeof a === 'number' && typeof b === 'number' && a < b),
});

registerOperator({
  id: 'between',
  label: 'is within range',
  comparandKind: 'range',
  evaluate: guardEmpty((a, b) => {
    if (typeof a !== 'number') return false;
    const range = asArray(b);
    if (!range || range.length !== 2) return false;
    const [lo, hi] = range as [unknown, unknown];
    return typeof lo === 'number' && typeof hi === 'number' && a >= lo && a <= hi;
  }),
});

registerOperator({
  id: 'containsAnyOf',
  label: 'contains any of',
  comparandKind: 'list',
  evaluate: guardEmpty((a, b) => {
    const lhs = asArray(a);
    const rhs = asArray(b);
    if (!lhs || !rhs) return false;
    return rhs.some((r) => lhs.some((l) => deepEq(l, r)));
  }),
});

registerOperator({
  id: 'containsAllOf',
  label: 'contains all of',
  comparandKind: 'list',
  evaluate: guardEmpty((a, b) => {
    const lhs = asArray(a);
    const rhs = asArray(b);
    if (!lhs || !rhs) return false;
    return rhs.every((r) => lhs.some((l) => deepEq(l, r)));
  }),
});

registerOperator({
  id: 'containsNoneOf',
  label: 'contains none of',
  comparandKind: 'list',
  evaluate: guardEmpty((a, b) => {
    const lhs = asArray(a);
    const rhs = asArray(b);
    if (!lhs || !rhs) return false;
    return rhs.every((r) => !lhs.some((l) => deepEq(l, r)));
  }),
});

const parseDate = (v: unknown): number | null => {
  if (typeof v !== 'string') return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
};

registerOperator({
  id: 'before',
  label: 'is before',
  comparandKind: 'value',
  evaluate: guardEmpty((a, b) => {
    const ta = parseDate(a);
    const tb = parseDate(b);
    return ta !== null && tb !== null && ta < tb;
  }),
});

registerOperator({
  id: 'after',
  label: 'is after',
  comparandKind: 'value',
  evaluate: guardEmpty((a, b) => {
    const ta = parseDate(a);
    const tb = parseDate(b);
    return ta !== null && tb !== null && ta > tb;
  }),
});
