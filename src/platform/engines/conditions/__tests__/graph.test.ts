import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  createCondition,
  addField,
  addConditionToField,
} from '@/domain/form/factories';
import {
  buildConditionsGraph,
  transitiveDependents,
} from '@/platform/engines/conditions/graph';

describe('buildConditionsGraph', () => {
  it('records dependsOn / dependents edges per condition target', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    const c = createField({ kind: 'text', key: 'c', label: 'C', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, c);
    f = addConditionToField(
      f,
      b.id,
      createCondition({ targetFieldId: a.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    f = addConditionToField(
      f,
      c.id,
      createCondition({ targetFieldId: b.id, operator: 'eq', value: 'y', effect: 'show' }),
    );
    const g = buildConditionsGraph(f);
    expect([...(g.dependsOn.get(b.id) ?? [])]).toEqual([a.id]);
    expect([...(g.dependsOn.get(c.id) ?? [])]).toEqual([b.id]);
    expect([...(g.dependents.get(a.id) ?? [])]).toEqual([b.id]);
    expect([...(g.dependents.get(b.id) ?? [])]).toEqual([c.id]);
  });
});

describe('transitiveDependents', () => {
  it('cascades through a chain', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    const c = createField({ kind: 'text', key: 'c', label: 'C', config: {} });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, c);
    f = addConditionToField(
      f,
      b.id,
      createCondition({ targetFieldId: a.id, operator: 'eq', value: 'x', effect: 'show' }),
    );
    f = addConditionToField(
      f,
      c.id,
      createCondition({ targetFieldId: b.id, operator: 'eq', value: 'y', effect: 'show' }),
    );
    const g = buildConditionsGraph(f);
    const deps = transitiveDependents(g, a.id);
    expect(deps.has(b.id)).toBe(true);
    expect(deps.has(c.id)).toBe(true);
    expect(deps.has(a.id)).toBe(false); // self not included
  });
});
