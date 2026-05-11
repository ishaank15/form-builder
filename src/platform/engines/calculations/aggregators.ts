/**
 * Aggregator registry — open lookup table from AggregatorId → pure compute.
 *
 * Per spec, aggregators operate on numbers from Number-field sources. The compute
 * function receives the *already-filtered* list of values (engine excludes hidden
 * sources). Aggregators must be total (no exceptions) — empty input returns 0 for
 * numeric aggregators rather than NaN.
 */
import type { AggregatorId } from '@/domain/calculation/types';

export interface AggregatorOptions {
  /** Decimal places. Default 2. */
  readonly precision?: number;
}

export interface AggregatorImpl {
  readonly id: AggregatorId;
  readonly label: string;
  readonly compute: (values: ReadonlyArray<unknown>, options: AggregatorOptions) => number;
}

const aggs = new Map<AggregatorId, AggregatorImpl>();

export const registerAggregator = (a: AggregatorImpl): void => {
  if (aggs.has(a.id)) throw new Error(`Aggregator already registered: ${a.id}`);
  aggs.set(a.id, a);
};

export const getAggregator = (id: AggregatorId): AggregatorImpl => {
  const a = aggs.get(id);
  if (!a) throw new Error(`Unknown aggregator: ${id}`);
  return a;
};

export const allAggregators = (): ReadonlyArray<AggregatorImpl> => [...aggs.values()];

const numbersOf = (vs: ReadonlyArray<unknown>): number[] =>
  vs.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

export const round = (n: number, p: number): number => {
  const f = 10 ** Math.max(0, Math.min(10, Math.trunc(p)));
  return Math.round(n * f) / f;
};

registerAggregator({
  id: 'SUM',
  label: 'Sum',
  compute: (vs, o) =>
    round(
      numbersOf(vs).reduce((a, b) => a + b, 0),
      o.precision ?? 2,
    ),
});

registerAggregator({
  id: 'AVG',
  label: 'Average',
  compute: (vs, o) => {
    const ns = numbersOf(vs);
    if (ns.length === 0) return 0;
    return round(
      ns.reduce((a, b) => a + b, 0) / ns.length,
      o.precision ?? 2,
    );
  },
});

registerAggregator({
  id: 'MIN',
  label: 'Minimum',
  compute: (vs, o) => {
    const ns = numbersOf(vs);
    if (ns.length === 0) return 0;
    return round(Math.min(...ns), o.precision ?? 2);
  },
});

registerAggregator({
  id: 'MAX',
  label: 'Maximum',
  compute: (vs, o) => {
    const ns = numbersOf(vs);
    if (ns.length === 0) return 0;
    return round(Math.max(...ns), o.precision ?? 2);
  },
});
