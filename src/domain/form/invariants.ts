/**
 * Form-level invariants. Run by the builder on save and by the persistence layer on load.
 *
 * These are checks too rich for a Zod schema (they require cross-field reasoning).
 * They produce a Result<void, Issue[]> so the editor can surface them inline.
 */
import type { FieldId } from '@/domain/id';
import type { FormDefinition, AnyFieldDefinition } from './types';

export type IssueSeverity = 'error' | 'warning';

export interface Issue {
  readonly severity: IssueSeverity;
  readonly code: string;
  readonly message: string;
  /** Field this issue is attached to (for inline UI). */
  readonly fieldId?: FieldId;
  /**
   * Optional structured detail. The visibility-cycle invariant uses this to carry the
   * cycle's field-id list so the modal can render labels in declaration order without
   * re-running the algorithm.
   */
  readonly detail?: { readonly cycle?: ReadonlyArray<FieldId> };
}

export interface InvariantsResult {
  readonly issues: ReadonlyArray<Issue>;
  readonly ok: boolean;
}

const merge = (issues: Issue[]): InvariantsResult => ({
  issues,
  ok: issues.every((i) => i.severity !== 'error'),
});

/* ---------- Individual invariants ---------- */

const uniqueKeys = (form: FormDefinition): Issue[] => {
  const seen = new Map<string, FieldId>();
  const issues: Issue[] = [];
  for (const f of form.fields) {
    const prior = seen.get(f.key);
    if (prior) {
      issues.push({
        severity: 'error',
        code: 'duplicate_key',
        message: `Field key "${f.key}" is used by multiple fields.`,
        fieldId: f.id,
      });
    } else {
      seen.set(f.key, f.id);
    }
  }
  return issues;
};

const noSelfReferencingConditions = (form: FormDefinition): Issue[] => {
  const issues: Issue[] = [];
  for (const f of form.fields) {
    for (const c of f.conditions) {
      if (c.targetFieldId === f.id) {
        issues.push({
          severity: 'error',
          code: 'self_reference',
          message: `Field "${f.label || f.key}" cannot have a condition on itself.`,
          fieldId: f.id,
        });
      }
    }
  }
  return issues;
};

const conditionTargetsExist = (form: FormDefinition): Issue[] => {
  const ids = new Set(form.fields.map((f) => f.id));
  const issues: Issue[] = [];
  for (const f of form.fields) {
    for (const c of f.conditions) {
      if (!ids.has(c.targetFieldId)) {
        issues.push({
          severity: 'warning',
          code: 'dangling_condition',
          message: `Field "${f.label || f.key}" has a condition referencing a field that no longer exists.`,
          fieldId: f.id,
        });
      }
    }
  }
  return issues;
};

/**
 * Calculation source constraint: a calculation field cannot reference another calculation
 * field as a source (per spec).
 *
 * This invariant inspects the calc field's config shape duck-style — it doesn't import
 * the registry to avoid an L1 → L2 dependency. The calc plugin schema enforces the field-id
 * shape; we just enforce the semantic constraint here.
 */
const calculationsDoNotChain = (form: FormDefinition): Issue[] => {
  const fieldsByKind = new Map<FieldId, string>(form.fields.map((f) => [f.id, f.kind]));
  const issues: Issue[] = [];
  for (const f of form.fields) {
    if (f.kind !== 'calculation') continue;
    const cfg = f.config as { sources?: ReadonlyArray<FieldId> } | undefined;
    if (!cfg || !Array.isArray(cfg.sources)) continue;
    for (const src of cfg.sources) {
      const srcKind = fieldsByKind.get(src);
      if (srcKind === 'calculation') {
        issues.push({
          severity: 'error',
          code: 'calculation_chain',
          message: `Calculation "${f.label || f.key}" uses another Calculation as a source.`,
          fieldId: f.id,
        });
      }
    }
  }
  return issues;
};

/**
 * Visibility cycle detection — Tarjan's strongly-connected-components over the
 * visibility-conditions graph. We only consider show/hide effects; required-state
 * cycles don't make a field unreachable.
 *
 * An SCC of size ≥ 2 is a cycle (multiple fields whose visibility transitively depends
 * on each other). Self-loops (size-1 SCC with self-edge) are caught by the dedicated
 * self-reference invariant; we skip them here to avoid duplicate issues.
 *
 * Reported as a WARNING, not an error: a cycle isn't always a deadlock — it depends on
 * each field's defaultVisibility. If all fields in the cycle default to hidden, the
 * form is unreachable; in other configurations the cycle may behave fine. The modal at
 * save time explains this and lets the builder save anyway after acknowledging.
 */
const detectVisibilityCycles = (form: FormDefinition): Issue[] => {
  const fieldById = new Map(form.fields.map((f) => [f.id, f]));

  // Edge: f → fields f's visibility depends on (only show/hide conditions).
  const deps = new Map<FieldId, ReadonlyArray<FieldId>>();
  for (const f of form.fields) {
    const targets: FieldId[] = [];
    for (const c of f.conditions) {
      if (c.effect === 'show' || c.effect === 'hide') targets.push(c.targetFieldId);
    }
    deps.set(f.id, targets);
  }

  // Tarjan's SCC algorithm.
  let counter = 0;
  const stack: FieldId[] = [];
  const onStack = new Set<FieldId>();
  const indices = new Map<FieldId, number>();
  const lowlinks = new Map<FieldId, number>();
  const sccs: FieldId[][] = [];

  const strongConnect = (v: FieldId): void => {
    indices.set(v, counter);
    lowlinks.set(v, counter);
    counter += 1;
    stack.push(v);
    onStack.add(v);

    for (const w of deps.get(v) ?? []) {
      if (!fieldById.has(w)) continue; // dangling target — skip; reported separately
      if (!indices.has(w)) {
        strongConnect(w);
        lowlinks.set(v, Math.min(lowlinks.get(v) ?? 0, lowlinks.get(w) ?? 0));
      } else if (onStack.has(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v) ?? 0, indices.get(w) ?? 0));
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      const scc: FieldId[] = [];
      let w: FieldId;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      sccs.push(scc);
    }
  };

  for (const f of form.fields) {
    if (!indices.has(f.id)) strongConnect(f.id);
  }

  const issues: Issue[] = [];
  for (const scc of sccs) {
    if (scc.length < 2) continue; // not a multi-field cycle
    // Order the cycle by field declaration order for deterministic display.
    const ordered = [...scc].sort((a, b) => {
      const ia = form.fields.findIndex((f) => f.id === a);
      const ib = form.fields.findIndex((f) => f.id === b);
      return ia - ib;
    });
    const labels = ordered.map((id) => fieldById.get(id)?.label || fieldById.get(id)?.key || 'unnamed');
    issues.push({
      severity: 'warning',
      code: 'visibility_cycle',
      message: `Visibility cycle: ${labels.join(' ↔ ')}. If all involved fields default to hidden, they may be unreachable in fill mode.`,
      detail: { cycle: ordered },
    });
  }

  return issues;
};

export const validateForm = (form: FormDefinition): InvariantsResult =>
  merge([
    ...uniqueKeys(form),
    ...noSelfReferencingConditions(form),
    ...conditionTargetsExist(form),
    ...calculationsDoNotChain(form),
    ...detectVisibilityCycles(form),
  ]);

/** Test helper / tiny accessor used by some UIs. */
export const findField = (
  form: FormDefinition,
  id: FieldId,
): AnyFieldDefinition | undefined => form.fields.find((f) => f.id === id);
