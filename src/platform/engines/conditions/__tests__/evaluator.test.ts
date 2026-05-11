import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  createCondition,
  addField,
  addConditionToField,
} from '@/domain/form/factories';
import { evaluateConditions } from '@/platform/engines/conditions/evaluator';

const buildBaseForm = () => {
  let f = createFormDefinition({ name: 't' });
  const a = createField({
    kind: 'singleSelect',
    key: 'country',
    label: 'Country',
    config: { options: [], displayMode: 'dropdown' },
  });
  const b = createField({
    kind: 'text',
    key: 'state',
    label: 'State',
    config: { placeholder: '', prefix: '', suffix: '' },
    defaultVisibility: 'hidden',
  });
  f = addField(f, a);
  f = addField(f, b);
  return { form: f, a, b };
};

describe('evaluateConditions — visibility', () => {
  it('returns default visibility when no conditions are active', () => {
    const { form, a, b } = buildBaseForm();
    const r = evaluateConditions(form, {});
    expect(r.visibility.get(a.id)).toBe(true); // visible by default
    expect(r.visibility.get(b.id)).toBe(false); // hidden by default
  });

  it('a "show" condition reveals a hidden-by-default field', () => {
    const base = buildBaseForm();
    const f = addConditionToField(
      base.form,
      base.b.id,
      createCondition({
        targetFieldId: base.a.id,
        operator: 'eq',
        value: 'US',
        effect: 'show',
      }),
    );
    const r1 = evaluateConditions(f, { [base.a.id]: 'US' });
    expect(r1.visibility.get(base.b.id)).toBe(true);
    const r2 = evaluateConditions(f, { [base.a.id]: 'CA' });
    expect(r2.visibility.get(base.b.id)).toBe(false);
  });

  it('last-active-condition-wins (declaration order)', () => {
    const base = buildBaseForm();
    const { a, b } = base;
    // First condition shows when value === "US"
    let form = addConditionToField(
      base.form,
      b.id,
      createCondition({
        targetFieldId: a.id,
        operator: 'eq',
        value: 'US',
        effect: 'show',
      }),
    );
    // Second condition hides when value !== "" (always true while value is "US")
    form = addConditionToField(
      form,
      b.id,
      createCondition({
        targetFieldId: a.id,
        operator: 'neq',
        value: '',
        effect: 'hide',
      }),
    );
    // Both are active when value === "US"; the LATER condition wins → hidden.
    const r = evaluateConditions(form, { [a.id]: 'US' });
    expect(r.visibility.get(b.id)).toBe(false);
  });

  it('an empty target value leaves the default state untouched (operator policy)', () => {
    const base = buildBaseForm();
    const f = addConditionToField(
      base.form,
      base.b.id,
      createCondition({
        targetFieldId: base.a.id,
        operator: 'eq',
        value: 'US',
        effect: 'show',
      }),
    );
    // A.value is undefined → operator returns false → default (hidden) wins.
    const r = evaluateConditions(f, {});
    expect(r.visibility.get(base.b.id)).toBe(false);
  });
});

describe('evaluateConditions — required state', () => {
  it('respects defaultRequired when no conditions match', () => {
    let f = createFormDefinition({ name: 't' });
    const fld = createField({
      kind: 'text',
      key: 'a',
      label: 'A',
      config: { placeholder: '', prefix: '', suffix: '' },
      defaultRequired: true,
    });
    f = addField(f, fld);
    const r = evaluateConditions(f, {});
    expect(r.required.get(fld.id)).toBe(true);
  });

  it('markNotRequired overrides defaultRequired when active', () => {
    let f = createFormDefinition({ name: 't' });
    const target = createField({
      kind: 'text',
      key: 'opt',
      label: 'Opt out',
      config: { placeholder: '', prefix: '', suffix: '' },
    });
    const fld = createField({
      kind: 'text',
      key: 'a',
      label: 'A',
      config: { placeholder: '', prefix: '', suffix: '' },
      defaultRequired: true,
    });
    f = addField(f, target);
    f = addField(f, fld);
    f = addConditionToField(
      f,
      fld.id,
      createCondition({
        targetFieldId: target.id,
        operator: 'eq',
        value: 'yes',
        effect: 'markNotRequired',
      }),
    );
    const r = evaluateConditions(f, { [target.id]: 'yes' });
    expect(r.required.get(fld.id)).toBe(false);
  });
});

describe('evaluateConditions — independence of axes', () => {
  it('visibility and required conditions do not interfere', () => {
    let f = createFormDefinition({ name: 't' });
    const target = createField({
      kind: 'text',
      key: 't',
      label: 'T',
      config: { placeholder: '', prefix: '', suffix: '' },
    });
    const fld = createField({
      kind: 'text',
      key: 'f',
      label: 'F',
      config: { placeholder: '', prefix: '', suffix: '' },
      defaultVisibility: 'hidden',
      defaultRequired: false,
    });
    f = addField(f, target);
    f = addField(f, fld);
    f = addConditionToField(
      f,
      fld.id,
      createCondition({
        targetFieldId: target.id,
        operator: 'eq',
        value: 'go',
        effect: 'show',
      }),
    );
    f = addConditionToField(
      f,
      fld.id,
      createCondition({
        targetFieldId: target.id,
        operator: 'eq',
        value: 'go',
        effect: 'markRequired',
      }),
    );
    const r = evaluateConditions(f, { [target.id]: 'go' });
    expect(r.visibility.get(fld.id)).toBe(true);
    expect(r.required.get(fld.id)).toBe(true);
  });
});
