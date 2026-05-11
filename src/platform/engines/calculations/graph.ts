/**
 * Calculation dependency graph + topological sort with cycle detection.
 *
 * Each calculation field declares `sources: FieldId[]`. We build a DAG where edges go
 * from a calc field's id to each of its sources (i.e. "this calc depends on these
 * sources"), then produce an evaluation order: sources first, calc fields after.
 *
 * Cycle detection is defensive: the spec disallows calc-of-calc (enforced in the form
 * invariants), but if a cycle slips through (older form data, hand-edited JSON), the
 * engine raises a structured error rather than infinite-looping.
 */
import type { FormDefinition } from '@/domain/form/types';
import type { FieldId } from '@/domain/id';
import type { CalculationFieldConfig } from '@/domain/calculation/types';

export interface CalculationCycleError {
  readonly kind: 'cycle';
  readonly cycle: ReadonlyArray<FieldId>;
}

export interface CalculationOrder {
  readonly order: ReadonlyArray<FieldId>; // calc field ids in topological order
}

export type CalculationOrderResult =
  | { readonly ok: true; readonly value: CalculationOrder }
  | { readonly ok: false; readonly error: CalculationCycleError };

const isCalcConfig = (cfg: unknown): cfg is CalculationFieldConfig =>
  typeof cfg === 'object' &&
  cfg !== null &&
  'sources' in cfg &&
  Array.isArray((cfg as { sources: unknown }).sources);

/** Returns calc fields' dependency edges: calcId → set of source field ids. */
export const buildCalculationsGraph = (
  form: FormDefinition,
): ReadonlyMap<FieldId, ReadonlySet<FieldId>> => {
  const edges = new Map<FieldId, Set<FieldId>>();
  for (const f of form.fields) {
    if (f.kind !== 'calculation') continue;
    if (!isCalcConfig(f.config)) {
      edges.set(f.id, new Set());
      continue;
    }
    edges.set(f.id, new Set(f.config.sources));
  }
  return edges;
};

/**
 * Kahn-style topological sort over calc fields. Non-calc field ids are not in the result;
 * they have no outgoing edges in this graph and are evaluated as inputs.
 *
 * Cycle detection: if we cannot drain the graph, the remaining nodes form at least one
 * cycle and we report them.
 */
export const topoSortCalculations = (form: FormDefinition): CalculationOrderResult => {
  const edges = buildCalculationsGraph(form);
  const calcIds = new Set(edges.keys());
  // In-degree counts only edges to other calc fields (intra-calc edges).
  const inDegree = new Map<FieldId, number>();
  const reverse = new Map<FieldId, Set<FieldId>>();
  for (const id of calcIds) {
    inDegree.set(id, 0);
    reverse.set(id, new Set());
  }
  for (const [calcId, sources] of edges) {
    for (const src of sources) {
      if (!calcIds.has(src)) continue; // non-calc source — not part of the calc DAG
      inDegree.set(calcId, (inDegree.get(calcId) ?? 0) + 1);
      reverse.get(src)!.add(calcId);
    }
  }

  const queue: FieldId[] = [];
  for (const [id, deg] of inDegree) if (deg === 0) queue.push(id);

  const order: FieldId[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    order.push(cur);
    for (const dependent of reverse.get(cur) ?? []) {
      const next = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, next);
      if (next === 0) queue.push(dependent);
    }
  }

  if (order.length !== calcIds.size) {
    const stuck = [...calcIds].filter((id) => !order.includes(id));
    return { ok: false, error: { kind: 'cycle', cycle: stuck } };
  }
  return { ok: true, value: { order } };
};
