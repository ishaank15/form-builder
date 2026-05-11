import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  createCondition,
  addField,
  removeField,
  updateField,
  reorderFields,
  addConditionToField,
  removeConditionFromField,
} from '@/domain/form/factories';

const buildForm = () => createFormDefinition({ name: 'Onboarding' });

const buildTextField = (key = 'first_name', label = 'First name') =>
  createField({
    kind: 'text',
    key,
    label,
    config: { placeholder: '' },
  });

describe('form factories', () => {
  it('creates a form with version 1, no fields, ISO timestamps', () => {
    const f = buildForm();
    expect(f.version).toBe(1);
    expect(f.fields).toHaveLength(0);
    expect(() => new Date(f.createdAt).toISOString()).not.toThrow();
  });

  it('addField appends at end and bumps version', () => {
    const f = addField(buildForm(), buildTextField());
    expect(f.fields).toHaveLength(1);
    expect(f.version).toBe(2);
  });

  it('addField inserts at index when provided', () => {
    let f = addField(buildForm(), buildTextField('a', 'A'));
    f = addField(f, buildTextField('b', 'B'));
    f = addField(f, buildTextField('c', 'C'), 1);
    expect(f.fields.map((x) => x.key)).toEqual(['a', 'c', 'b']);
  });

  it('removeField strips conditions targeting the removed field', () => {
    const target = buildTextField('country', 'Country');
    const dependent = buildTextField('state', 'State');
    let f = addField(buildForm(), target);
    f = addField(f, dependent);
    const cond = createCondition({
      targetFieldId: target.id,
      operator: 'eq',
      value: 'US',
      effect: 'show',
    });
    f = addConditionToField(f, dependent.id, cond);
    expect(f.fields[1]!.conditions).toHaveLength(1);

    f = removeField(f, target.id);
    expect(f.fields).toHaveLength(1);
    expect(f.fields[0]!.conditions).toHaveLength(0); // dangling cond stripped
  });

  it('updateField patches fields immutably', () => {
    const fld = buildTextField();
    const f1 = addField(buildForm(), fld);
    const f2 = updateField(f1, fld.id, { label: 'Renamed' });
    expect(f1.fields[0]!.label).toBe('First name');
    expect(f2.fields[0]!.label).toBe('Renamed');
  });

  it('reorderFields moves the field to the target index', () => {
    let f = addField(buildForm(), buildTextField('a'));
    f = addField(f, buildTextField('b'));
    f = addField(f, buildTextField('c'));
    f = reorderFields(f, 0, 2);
    expect(f.fields.map((x) => x.key)).toEqual(['b', 'c', 'a']);
  });

  it('reorderFields is a no-op when from === to', () => {
    let f = addField(buildForm(), buildTextField('a'));
    f = addField(f, buildTextField('b'));
    const before = f;
    f = reorderFields(f, 1, 1);
    expect(f).toBe(before);
  });

  it('removeConditionFromField removes only the specified condition', () => {
    const target = buildTextField('a');
    const dependent = buildTextField('b');
    let f = addField(buildForm(), target);
    f = addField(f, dependent);
    const c1 = createCondition({
      targetFieldId: target.id,
      operator: 'eq',
      value: 'x',
      effect: 'show',
    });
    const c2 = createCondition({
      targetFieldId: target.id,
      operator: 'neq',
      value: 'y',
      effect: 'hide',
    });
    f = addConditionToField(f, dependent.id, c1);
    f = addConditionToField(f, dependent.id, c2);
    expect(f.fields[1]!.conditions).toHaveLength(2);

    f = removeConditionFromField(f, dependent.id, c1.id);
    expect(f.fields[1]!.conditions).toHaveLength(1);
    expect(f.fields[1]!.conditions[0]!.id).toBe(c2.id);
  });
});
