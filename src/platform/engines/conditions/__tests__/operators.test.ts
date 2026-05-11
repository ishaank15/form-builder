import { describe, it, expect } from 'vitest';
import { getOperator, allOperators, isEmpty } from '@/platform/engines/conditions';
import type { OperatorId } from '@/domain/condition/types';

const expectAll = (rows: ReadonlyArray<readonly [OperatorId, unknown, unknown, boolean]>) => {
  for (const [op, lhs, rhs, expected] of rows) {
    const got = getOperator(op).evaluate(lhs, rhs);
    expect(got, `operator ${op} on (${JSON.stringify(lhs)}, ${JSON.stringify(rhs)})`).toBe(
      expected,
    );
  }
};

describe('operator: empty-target policy', () => {
  it('every operator returns false when lhs is empty (per spec default-state policy)', () => {
    for (const op of allOperators()) {
      expect(op.evaluate(undefined, 'anything'), op.id).toBe(false);
      expect(op.evaluate('', 'anything'), op.id).toBe(false);
      expect(op.evaluate([], ['x']), op.id).toBe(false);
    }
  });
});

describe('isEmpty', () => {
  it.each([
    [undefined, true],
    [null, true],
    ['', true],
    ['   ', true],
    ['a', false],
    [[], true],
    [[1], false],
    [0, false],
    [false, false],
  ])('isEmpty(%j) === %s', (input, expected) => {
    expect(isEmpty(input)).toBe(expected);
  });
});

describe('eq / neq', () => {
  it('matches deep-equal primitives and arrays', () => {
    expectAll([
      ['eq', 'a', 'a', true],
      ['eq', 'a', 'b', false],
      ['eq', 1, 1, true],
      ['eq', [1, 2], [1, 2], true],
      ['eq', [1, 2], [2, 1], false],
      ['neq', 'a', 'b', true],
      ['neq', 'a', 'a', false],
    ]);
  });
});

describe('contains', () => {
  it('substring on strings, false on non-strings', () => {
    expectAll([
      ['contains', 'hello world', 'world', true],
      ['contains', 'hello', 'xyz', false],
      ['contains', 5, '5', false],
    ]);
  });
});

describe('gt / lt / between', () => {
  it('numeric inequality + range', () => {
    expectAll([
      ['gt', 10, 5, true],
      ['gt', 5, 10, false],
      ['lt', 5, 10, true],
      ['between', 5, [1, 10], true],
      ['between', 11, [1, 10], false],
      ['between', 1, [1, 10], true],
      ['between', 10, [1, 10], true],
    ]);
  });

  it('between rejects malformed comparand', () => {
    expectAll([
      ['between', 5, [1], false],
      ['between', 5, 'nope', false],
      ['between', 'x', [1, 10], false],
    ]);
  });
});

describe('multi-select operators', () => {
  it('any / all / none semantics', () => {
    expectAll([
      ['containsAnyOf', ['a', 'b'], ['b', 'c'], true],
      ['containsAnyOf', ['a', 'b'], ['x'], false],
      ['containsAllOf', ['a', 'b', 'c'], ['a', 'b'], true],
      ['containsAllOf', ['a', 'b'], ['a', 'b', 'c'], false],
      ['containsNoneOf', ['a', 'b'], ['x', 'y'], true],
      ['containsNoneOf', ['a', 'b'], ['b'], false],
    ]);
  });
});

describe('date operators', () => {
  it('before / after by ISO string', () => {
    expectAll([
      ['before', '2024-01-01', '2024-06-01', true],
      ['before', '2024-06-01', '2024-01-01', false],
      ['after', '2024-06-01', '2024-01-01', true],
      ['after', '2024-01-01', '2024-06-01', false],
    ]);
  });

  it('returns false for unparseable strings', () => {
    expectAll([
      ['before', 'not-a-date', '2024-01-01', false],
      ['after', '2024-01-01', 'not-a-date', false],
    ]);
  });
});
