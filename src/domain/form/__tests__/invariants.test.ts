import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  createCondition,
  addField,
  addConditionToField,
} from '@/domain/form/factories';
import { validateForm } from '@/domain/form/invariants';

describe('form invariants', () => {
  it('reports duplicate field keys as errors', () => {
    let f = createFormDefinition({ name: 't' });
    f = addField(
      f,
      createField({ kind: 'text', key: 'name', label: 'Name', config: {} }),
    );
    f = addField(
      f,
      createField({ kind: 'text', key: 'name', label: 'Name 2', config: {} }),
    );
    const r = validateForm(f);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === 'duplicate_key')).toBe(true);
  });

  it('flags a self-referencing condition as an error', () => {
    let f = createFormDefinition({ name: 't' });
    const fld = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    f = addField(f, fld);
    f = addConditionToField(
      f,
      fld.id,
      createCondition({
        targetFieldId: fld.id,
        operator: 'eq',
        value: 'x',
        effect: 'show',
      }),
    );
    const r = validateForm(f);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === 'self_reference')).toBe(true);
  });

  it('reports a dangling condition target as a warning, not an error', () => {
    // We construct a form where a condition's targetFieldId points at a non-existent id.
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    f = addConditionToField(
      f,
      b.id,
      createCondition({
        targetFieldId: a.id,
        operator: 'eq',
        value: 'x',
        effect: 'show',
      }),
    );
    // Manually replace `a` with a different field, simulating a stale reference.
    const stale = {
      ...f,
      fields: [
        createField({ kind: 'text', key: 'a2', label: 'A2', config: {} }),
        f.fields[1]!,
      ],
    };
    const r = validateForm(stale);
    expect(r.ok).toBe(true); // warnings only
    expect(r.issues.some((i) => i.code === 'dangling_condition')).toBe(true);
  });

  it('rejects a calculation field that uses another calculation as a source', () => {
    let f = createFormDefinition({ name: 't' });
    const calcA = createField({
      kind: 'calculation',
      key: 'sum_a',
      label: 'A',
      config: { sources: [], aggregator: 'SUM', precision: 2 },
    });
    f = addField(f, calcA);
    const calcB = createField({
      kind: 'calculation',
      key: 'sum_b',
      label: 'B',
      config: { sources: [calcA.id], aggregator: 'SUM', precision: 2 },
    });
    f = addField(f, calcB);
    const r = validateForm(f);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === 'calculation_chain')).toBe(true);
  });

  it('passes a clean form', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    const r = validateForm(f);
    expect(r.ok).toBe(true);
    expect(r.issues).toHaveLength(0);
  });

  it('detects a 2-field visibility cycle (warning, with cycle path)', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({
      kind: 'number',
      key: 'a',
      label: 'A',
      config: { decimals: 0, prefix: '', suffix: '' },
      defaultVisibility: 'hidden',
    });
    const b = createField({
      kind: 'number',
      key: 'b',
      label: 'B',
      config: { decimals: 0, prefix: '', suffix: '' },
      defaultVisibility: 'hidden',
    });
    f = addField(f, a);
    f = addField(f, b);
    f = addConditionToField(
      f,
      a.id,
      createCondition({ targetFieldId: b.id, operator: 'eq', value: 2, effect: 'show' }),
    );
    f = addConditionToField(
      f,
      b.id,
      createCondition({ targetFieldId: a.id, operator: 'eq', value: 2, effect: 'show' }),
    );
    const r = validateForm(f);
    expect(r.ok).toBe(true); // warnings only
    const cycle = r.issues.find((i) => i.code === 'visibility_cycle');
    expect(cycle).toBeDefined();
    expect(cycle?.detail?.cycle).toBeDefined();
    expect(new Set(cycle?.detail?.cycle ?? [])).toEqual(new Set([a.id, b.id]));
  });

  it('detects a 3-field cycle (A → B → C → A)', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    const c = createField({ kind: 'text', key: 'c', label: 'C', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, c);
    f = addConditionToField(
      f,
      a.id,
      createCondition({ targetFieldId: b.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    f = addConditionToField(
      f,
      b.id,
      createCondition({ targetFieldId: c.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    f = addConditionToField(
      f,
      c.id,
      createCondition({ targetFieldId: a.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    const r = validateForm(f);
    const cycle = r.issues.find((i) => i.code === 'visibility_cycle');
    expect(cycle).toBeDefined();
    expect(new Set(cycle?.detail?.cycle ?? [])).toEqual(new Set([a.id, b.id, c.id]));
  });

  it('does not flag parallel non-cyclic dependencies as cycles', () => {
    // A and B both depend on C — no cycle.
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    const c = createField({ kind: 'text', key: 'c', label: 'C', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, c);
    f = addConditionToField(
      f,
      a.id,
      createCondition({ targetFieldId: c.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    f = addConditionToField(
      f,
      b.id,
      createCondition({ targetFieldId: c.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    const r = validateForm(f);
    expect(r.issues.find((i) => i.code === 'visibility_cycle')).toBeUndefined();
  });

  it('only considers show/hide for cycle detection, not required-state effects', () => {
    // A and B mutually mark-required each other — that's a "cycle" only on the required
    // axis, which can't make a field unreachable, so we shouldn't flag it.
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    f = addConditionToField(
      f,
      a.id,
      createCondition({
        targetFieldId: b.id,
        operator: 'eq',
        value: 'x',
        effect: 'markRequired',
      }),
    );
    f = addConditionToField(
      f,
      b.id,
      createCondition({
        targetFieldId: a.id,
        operator: 'eq',
        value: 'x',
        effect: 'markRequired',
      }),
    );
    const r = validateForm(f);
    expect(r.issues.find((i) => i.code === 'visibility_cycle')).toBeUndefined();
  });
});
