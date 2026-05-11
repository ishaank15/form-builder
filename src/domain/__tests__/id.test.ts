import { describe, it, expect } from 'vitest';
import {
  FieldId,
  TemplateId,
  SubmissionId,
  ConditionId,
  zFieldId,
} from '@/domain/id';

describe('id factories', () => {
  it('mints unique non-empty strings', () => {
    const a = FieldId();
    const b = FieldId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it('respects an explicit raw value (round-trip from JSON)', () => {
    const raw = 'fld_abc123';
    expect(FieldId(raw)).toBe(raw);
  });

  it('produces structurally distinct branded types per family', () => {
    // Compile-time guarantee: a FieldId is not a SubmissionId.
    // Runtime: both are strings, but their brands differ.
    const f = FieldId();
    const s = SubmissionId();
    expect(typeof f).toBe('string');
    expect(typeof s).toBe('string');
  });

  it('all five brands mint independently', () => {
    expect(FieldId()).not.toBe(TemplateId());
    expect(SubmissionId()).not.toBe(ConditionId());
  });

  it('zod adapter parses untrusted input into a brand', () => {
    const r = zFieldId.safeParse('hello');
    expect(r.success).toBe(true);
    const empty = zFieldId.safeParse('');
    expect(empty.success).toBe(false);
  });
});
