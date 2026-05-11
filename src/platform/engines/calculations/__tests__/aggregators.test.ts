import { describe, it, expect } from 'vitest';
import { getAggregator, allAggregators, round } from '@/platform/engines/calculations';

describe('round', () => {
  it.each([
    [1.234, 2, 1.23],
    [1.235, 2, 1.24],
    [1.5, 0, 2],
    [-1.5, 0, -1],
  ])('round(%f, %i) === %f', (n, p, expected) => {
    expect(round(n, p)).toBe(expected);
  });
});

describe('SUM', () => {
  it('sums numeric values, ignores non-numbers', () => {
    expect(getAggregator('SUM').compute([1, 2, 3], { precision: 2 })).toBe(6);
    expect(getAggregator('SUM').compute([1, '2' as unknown, 3], { precision: 2 })).toBe(4);
    expect(getAggregator('SUM').compute([], { precision: 2 })).toBe(0);
  });

  it('rounds to precision', () => {
    expect(getAggregator('SUM').compute([0.1, 0.2], { precision: 2 })).toBeCloseTo(0.3, 5);
  });
});

describe('AVG', () => {
  it('averages, returns 0 for empty', () => {
    expect(getAggregator('AVG').compute([2, 4, 6], { precision: 2 })).toBe(4);
    expect(getAggregator('AVG').compute([], { precision: 2 })).toBe(0);
  });
});

describe('MIN / MAX', () => {
  it('extremes on numeric subset', () => {
    expect(getAggregator('MIN').compute([3, 1, 2], { precision: 0 })).toBe(1);
    expect(getAggregator('MAX').compute([3, 1, 2], { precision: 0 })).toBe(3);
    expect(getAggregator('MIN').compute([], { precision: 0 })).toBe(0);
    expect(getAggregator('MAX').compute([], { precision: 0 })).toBe(0);
  });
});

describe('registry', () => {
  it('exposes all four spec aggregators', () => {
    const ids = allAggregators().map((a) => a.id).sort();
    expect(ids).toEqual(['AVG', 'MAX', 'MIN', 'SUM']);
  });
});
