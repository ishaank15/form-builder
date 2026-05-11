import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  createCondition,
  addField,
  addConditionToField,
} from '@/domain/form/factories';
import { evaluateConditions } from '@/platform/engines/conditions';
import { validateValues } from '@/platform/engines/validation';

const text = (key: string, opts: { required?: boolean; minLength?: number } = {}) =>
  createField({
    kind: 'text',
    key,
    label: key,
    config: {
      placeholder: '',
      prefix: '',
      suffix: '',
      ...(opts.minLength !== undefined ? { minLength: opts.minLength } : {}),
    },
    defaultRequired: opts.required ?? false,
  });

describe('validateValues — required', () => {
  it('reports an error for an empty required field', () => {
    let f = createFormDefinition({ name: 't' });
    const a = text('a', { required: true });
    f = addField(f, a);
    const cond = evaluateConditions(f, {});
    const r = validateValues(f, {}, cond);
    expect(r.ok).toBe(false);
    expect(r.errors.get(a.id)).toBe('This field is required.');
  });

  it('passes when required field has a value', () => {
    let f = createFormDefinition({ name: 't' });
    const a = text('a', { required: true });
    f = addField(f, a);
    const cond = evaluateConditions(f, { [a.id]: 'hi' });
    const r = validateValues(f, { [a.id]: 'hi' }, cond);
    expect(r.ok).toBe(true);
  });

  it('does not validate empty optional fields', () => {
    let f = createFormDefinition({ name: 't' });
    const a = text('a', { required: false });
    f = addField(f, a);
    const cond = evaluateConditions(f, {});
    const r = validateValues(f, {}, cond);
    expect(r.ok).toBe(true);
  });
});

describe('validateValues — hidden fields are not validated (spec rule)', () => {
  it('hidden + required + empty → no error', () => {
    let f = createFormDefinition({ name: 't' });
    const target = text('t');
    const hidden = text('h', { required: true });
    f = addField(f, target);
    f = addField(f, { ...hidden, defaultVisibility: 'hidden' });
    const cond = evaluateConditions(f, {}); // no value, hidden stays hidden
    const r = validateValues(f, {}, cond);
    expect(r.ok).toBe(true);
    expect(r.errors.has(hidden.id)).toBe(false);
  });

  it('a field that is required only when conditions activate it must validate', () => {
    let f = createFormDefinition({ name: 't' });
    const target = text('t');
    const a = text('a', { required: false });
    f = addField(f, target);
    f = addField(f, a);
    f = addConditionToField(
      f,
      a.id,
      createCondition({
        targetFieldId: target.id,
        operator: 'eq',
        value: 'go',
        effect: 'markRequired',
      }),
    );
    // condition active; field a must be required
    const cond = evaluateConditions(f, { [target.id]: 'go' });
    const r = validateValues(f, { [target.id]: 'go' }, cond);
    expect(r.ok).toBe(false);
    expect(r.errors.get(a.id)).toBe('This field is required.');
  });
});

describe('validateValues — per-plugin schema', () => {
  it('text minLength is enforced via the plugin schema', () => {
    let f = createFormDefinition({ name: 't' });
    const a = text('a', { minLength: 3 });
    f = addField(f, a);
    const cond = evaluateConditions(f, { [a.id]: 'hi' });
    const r = validateValues(f, { [a.id]: 'hi' }, cond);
    expect(r.ok).toBe(false);
    expect(r.errors.get(a.id)).toBeTruthy();
  });
});
