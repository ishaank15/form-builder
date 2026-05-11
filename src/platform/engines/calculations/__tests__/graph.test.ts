import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  addField,
} from '@/domain/form/factories';
import { topoSortCalculations } from '@/platform/engines/calculations/graph';

describe('topoSortCalculations', () => {
  it('orders independent calc fields trivially', () => {
    let f = createFormDefinition({ name: 't' });
    const num = createField({
      kind: 'number',
      key: 'n',
      label: 'N',
      config: { decimals: 0, prefix: '', suffix: '' },
    });
    const calcA = createField({
      kind: 'calculation',
      key: 'ca',
      label: 'A',
      config: { sources: [num.id], aggregator: 'SUM', precision: 2 },
    });
    const calcB = createField({
      kind: 'calculation',
      key: 'cb',
      label: 'B',
      config: { sources: [num.id], aggregator: 'AVG', precision: 2 },
    });
    f = addField(f, num);
    f = addField(f, calcA);
    f = addField(f, calcB);
    const r = topoSortCalculations(f);
    expect(r.ok).toBe(true);
    if (r.ok) expect(new Set(r.value.order)).toEqual(new Set([calcA.id, calcB.id]));
  });

  it('detects a calc-on-calc cycle', () => {
    let f = createFormDefinition({ name: 't' });
    // Two calcs that source each other (illegal per spec but engine must detect).
    const calcA = createField({
      kind: 'calculation',
      key: 'a',
      label: 'A',
      // sources will reference calcB.id once we have it; use placeholder for now
      config: { sources: [], aggregator: 'SUM', precision: 2 },
    });
    const calcB = createField({
      kind: 'calculation',
      key: 'b',
      label: 'B',
      config: { sources: [calcA.id], aggregator: 'SUM', precision: 2 },
    });
    // Mutate calcA to depend on calcB (rebuild since field is readonly).
    const calcAWithCycle = {
      ...calcA,
      config: { sources: [calcB.id], aggregator: 'SUM' as const, precision: 2 },
    };
    f = addField(f, calcAWithCycle);
    f = addField(f, calcB);
    const r = topoSortCalculations(f);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('cycle');
      expect(new Set(r.error.cycle)).toEqual(new Set([calcAWithCycle.id, calcB.id]));
    }
  });

  it('produces a valid order when one calc legally chains to another (defensive)', () => {
    // Engines are robust to calc-of-calc even though invariants forbid it.
    let f = createFormDefinition({ name: 't' });
    const num = createField({
      kind: 'number',
      key: 'n',
      label: 'N',
      config: { decimals: 0, prefix: '', suffix: '' },
    });
    const calcA = createField({
      kind: 'calculation',
      key: 'a',
      label: 'A',
      config: { sources: [num.id], aggregator: 'SUM', precision: 2 },
    });
    const calcB = createField({
      kind: 'calculation',
      key: 'b',
      label: 'B',
      config: { sources: [calcA.id], aggregator: 'SUM', precision: 2 },
    });
    f = addField(f, num);
    f = addField(f, calcA);
    f = addField(f, calcB);
    const r = topoSortCalculations(f);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const idxA = r.value.order.indexOf(calcA.id);
      const idxB = r.value.order.indexOf(calcB.id);
      expect(idxA).toBeLessThan(idxB);
    }
  });
});
