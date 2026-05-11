/**
 * Conditions dependency graph.
 *
 * For each field, lists the fields whose values its conditions depend on (`dependsOn`)
 * and the inverse (`dependents`). Used by hooks in M5/M6 to limit re-evaluation to the
 * affected subset of fields when a single value changes — without this, every keystroke
 * would re-evaluate every field on the form.
 *
 * No cycle detection here: condition cycles are not a correctness problem with our
 * direct-read policy (see evaluator.ts). Calculation cycles are detected separately.
 */
import type { FormDefinition } from '@/domain/form/types';
import type { FieldId } from '@/domain/id';

export interface ConditionsGraph {
  readonly dependsOn: ReadonlyMap<FieldId, ReadonlySet<FieldId>>;
  readonly dependents: ReadonlyMap<FieldId, ReadonlySet<FieldId>>;
}

export const buildConditionsGraph = (form: FormDefinition): ConditionsGraph => {
  const dependsOn = new Map<FieldId, Set<FieldId>>();
  const dependents = new Map<FieldId, Set<FieldId>>();

  const addEdge = (from: FieldId, to: FieldId) => {
    let src = dependsOn.get(from);
    if (!src) {
      src = new Set();
      dependsOn.set(from, src);
    }
    src.add(to);
    let dst = dependents.get(to);
    if (!dst) {
      dst = new Set();
      dependents.set(to, dst);
    }
    dst.add(from);
  };

  for (const field of form.fields) {
    if (!dependsOn.has(field.id)) dependsOn.set(field.id, new Set());
    if (!dependents.has(field.id)) dependents.set(field.id, new Set());
    for (const cond of field.conditions) {
      addEdge(field.id, cond.targetFieldId);
    }
  }

  return { dependsOn, dependents };
};

/** Dependents-of helper that closes over transitive deps (for cascading re-eval). */
export const transitiveDependents = (
  graph: ConditionsGraph,
  fieldId: FieldId,
): ReadonlySet<FieldId> => {
  const out = new Set<FieldId>();
  const stack: FieldId[] = [fieldId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    const deps = graph.dependents.get(cur);
    if (!deps) continue;
    for (const d of deps) {
      if (!out.has(d)) {
        out.add(d);
        stack.push(d);
      }
    }
  }
  return out;
};
