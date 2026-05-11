import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  addField,
} from '@/domain/form/factories';
import { evaluateCalculations } from '@/platform/engines/calculations/evaluator';
import type { FieldId } from '@/domain/id';

const numField = (key: string) =>
  createField({
    kind: 'number',
    key,
    label: key,
    config: { decimals: 0, prefix: '', suffix: '' },
  });

describe('evaluateCalculations', () => {
  it('computes SUM over numeric sources', () => {
    let f = createFormDefinition({ name: 't' });
    const a = numField('a');
    const b = numField('b');
    const calc = createField({
      kind: 'calculation',
      key: 'tot',
      label: 'Total',
      config: { sources: [a.id, b.id], aggregator: 'SUM', precision: 2 },
    });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, calc);
    const r = evaluateCalculations(
      f,
      { [a.id]: 10, [b.id]: 5 },
      new Map<FieldId, boolean>([
        [a.id, true],
        [b.id, true],
        [calc.id, true],
      ]),
    );
    expect(r.values.get(calc.id)).toBe(15);
    expect(r.stuck).toEqual([]);
  });

  it('skips hidden source fields from the aggregation', () => {
    let f = createFormDefinition({ name: 't' });
    const a = numField('a');
    const b = numField('b');
    const calc = createField({
      kind: 'calculation',
      key: 'tot',
      label: 'Total',
      config: { sources: [a.id, b.id], aggregator: 'SUM', precision: 2 },
    });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, calc);
    const r = evaluateCalculations(
      f,
      { [a.id]: 10, [b.id]: 5 },
      new Map<FieldId, boolean>([
        [a.id, true],
        [b.id, false], // hidden
        [calc.id, true],
      ]),
    );
    expect(r.values.get(calc.id)).toBe(10);
  });

  it('returns 0 for a calc with all sources empty', () => {
    let f = createFormDefinition({ name: 't' });
    const a = numField('a');
    const calc = createField({
      kind: 'calculation',
      key: 'avg',
      label: 'Avg',
      config: { sources: [a.id], aggregator: 'AVG', precision: 2 },
    });
    f = addField(f, a);
    f = addField(f, calc);
    const r = evaluateCalculations(f, {}, new Map([[a.id, true]]));
    expect(r.values.get(calc.id)).toBe(0);
  });

  it('reports stuck calcs on cycle and skips evaluation', () => {
    let f = createFormDefinition({ name: 't' });
    const calcA = createField({
      kind: 'calculation',
      key: 'a',
      label: 'A',
      config: { sources: [], aggregator: 'SUM', precision: 2 },
    });
    const calcB = createField({
      kind: 'calculation',
      key: 'b',
      label: 'B',
      config: { sources: [calcA.id], aggregator: 'SUM', precision: 2 },
    });
    const calcAWithCycle = {
      ...calcA,
      config: { sources: [calcB.id], aggregator: 'SUM' as const, precision: 2 },
    };
    f = addField(f, calcAWithCycle);
    f = addField(f, calcB);
    const r = evaluateCalculations(f, {}, new Map());
    expect(r.values.size).toBe(0);
    expect(new Set(r.stuck)).toEqual(new Set([calcAWithCycle.id, calcB.id]));
  });

  it('respects precision', () => {
    let f = createFormDefinition({ name: 't' });
    const a = numField('a');
    const b = numField('b');
    const calc = createField({
      kind: 'calculation',
      key: 'avg',
      label: 'Avg',
      config: { sources: [a.id, b.id], aggregator: 'AVG', precision: 3 },
    });
    f = addField(f, a);
    f = addField(f, b);
    f = addField(f, calc);
    const r = evaluateCalculations(
      f,
      { [a.id]: 1, [b.id]: 2 },
      new Map<FieldId, boolean>([
        [a.id, true],
        [b.id, true],
        [calc.id, true],
      ]),
    );
    expect(r.values.get(calc.id)).toBe(1.5);
  });
});
