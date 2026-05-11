import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  addField,
} from '@/domain/form/factories';
import { buildSubmission } from '@/domain/submission/builder';
import type { FieldId } from '@/domain/id';

describe('buildSubmission', () => {
  it('excludes hidden fields from values (per spec)', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    const b = createField({ kind: 'text', key: 'b', label: 'B', config: {} });
    f = addField(f, a);
    f = addField(f, b);

    const visibility = new Map<FieldId, boolean>([
      [a.id, true],
      [b.id, false], // hidden
    ]);
    const sub = buildSubmission({
      form: f,
      state: {
        values: { [a.id]: 'alice', [b.id]: 'should not appear' },
        touched: {},
      },
      visibility,
    });

    expect(sub.values[a.id]).toBe('alice');
    expect(b.id in sub.values).toBe(false);
  });

  it('excludes section headers (non-input)', () => {
    let f = createFormDefinition({ name: 't' });
    const heading = createField({
      kind: 'section',
      key: 'h',
      label: 'Section A',
      config: { size: 'M' },
    });
    f = addField(f, heading);
    const sub = buildSubmission({
      form: f,
      state: { values: { [heading.id]: 'ignored' }, touched: {} },
      visibility: new Map([[heading.id, true]]),
    });
    expect(heading.id in sub.values).toBe(false);
  });

  it('pins template version and schema version on the submission', () => {
    const f = createFormDefinition({ name: 't' });
    const sub = buildSubmission({
      form: f,
      state: { values: {}, touched: {} },
      visibility: new Map(),
    });
    expect(sub.templateId).toBe(f.id);
    expect(sub.templateVersion).toBe(f.version);
    expect(sub.schemaVersion).toBe(f.schemaVersion);
  });

  it('treats missing visibility entries as visible (default)', () => {
    let f = createFormDefinition({ name: 't' });
    const a = createField({ kind: 'text', key: 'a', label: 'A', config: {} });
    f = addField(f, a);
    const sub = buildSubmission({
      form: f,
      state: { values: { [a.id]: 'x' }, touched: {} },
      visibility: new Map(), // no entries
    });
    expect(sub.values[a.id]).toBe('x');
  });
});
