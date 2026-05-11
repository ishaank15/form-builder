/**
 * Pure factories for constructing domain values. The ONLY place new IDs and timestamps
 * appear, which makes mutation paths easy to audit.
 */
import { TemplateId, FieldId, ConditionId } from '@/domain/id';
import type { FieldId as FieldIdT } from '@/domain/id';
import type {
  AnyFieldDefinition,
  DefaultVisibility,
  FormDefinition,
} from './types';
import { FORM_SCHEMA_VERSION } from './types';
import type { Condition, ConditionEffect, OperatorId } from '@/domain/condition/types';

const now = (): string => new Date().toISOString();

export const createFormDefinition = (input: {
  name: string;
  description?: string;
}): FormDefinition => {
  const ts = now();
  return {
    schemaVersion: FORM_SCHEMA_VERSION,
    id: TemplateId(),
    name: input.name,
    ...(input.description !== undefined ? { description: input.description } : {}),
    version: 1,
    createdAt: ts,
    updatedAt: ts,
    fields: [],
  };
};

export const createField = <TKind extends string, TConfig>(input: {
  kind: TKind;
  key: string;
  label: string;
  config: TConfig;
  helpText?: string;
  defaultVisibility?: DefaultVisibility;
  defaultRequired?: boolean;
}): AnyFieldDefinition => ({
  id: FieldId(),
  kind: input.kind,
  key: input.key,
  label: input.label,
  ...(input.helpText !== undefined ? { helpText: input.helpText } : {}),
  config: input.config,
  defaultVisibility: input.defaultVisibility ?? 'visible',
  defaultRequired: input.defaultRequired ?? false,
  conditions: [],
});

export const createCondition = (input: {
  targetFieldId: FieldIdT;
  operator: OperatorId;
  value: unknown;
  effect: ConditionEffect;
}): Condition => ({
  id: ConditionId(),
  targetFieldId: input.targetFieldId,
  operator: input.operator,
  value: input.value,
  effect: input.effect,
});

/* ---------- Pure update helpers (return new FormDefinitions, never mutate) ---------- */

const touch = (form: FormDefinition): FormDefinition => ({
  ...form,
  updatedAt: now(),
  version: form.version + 1,
});

export const addField = (
  form: FormDefinition,
  field: AnyFieldDefinition,
  insertAt?: number,
): FormDefinition => {
  const fields = [...form.fields];
  if (insertAt === undefined) fields.push(field);
  else fields.splice(insertAt, 0, field);
  return touch({ ...form, fields });
};

export const removeField = (form: FormDefinition, fieldId: FieldIdT): FormDefinition => {
  const fields = form.fields.filter((f) => f.id !== fieldId);
  // Also strip conditions targeting the removed field — they'd be dangling.
  const cleaned = fields.map((f) => ({
    ...f,
    conditions: f.conditions.filter((c) => c.targetFieldId !== fieldId),
  }));
  return touch({ ...form, fields: cleaned });
};

export const updateField = (
  form: FormDefinition,
  fieldId: FieldIdT,
  patch: Partial<AnyFieldDefinition>,
): FormDefinition => {
  const fields = form.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f));
  return touch({ ...form, fields });
};

export const reorderFields = (
  form: FormDefinition,
  fromIndex: number,
  toIndex: number,
): FormDefinition => {
  if (fromIndex === toIndex) return form;
  const fields = [...form.fields];
  const moving = fields[fromIndex];
  if (!moving) return form;
  fields.splice(fromIndex, 1);
  fields.splice(toIndex, 0, moving);
  return touch({ ...form, fields });
};

export const addConditionToField = (
  form: FormDefinition,
  fieldId: FieldIdT,
  condition: Condition,
): FormDefinition => {
  const fields = form.fields.map((f) =>
    f.id === fieldId ? { ...f, conditions: [...f.conditions, condition] } : f,
  );
  return touch({ ...form, fields });
};

export const removeConditionFromField = (
  form: FormDefinition,
  fieldId: FieldIdT,
  conditionId: Condition['id'],
): FormDefinition => {
  const fields = form.fields.map((f) =>
    f.id === fieldId
      ? { ...f, conditions: f.conditions.filter((c) => c.id !== conditionId) }
      : f,
  );
  return touch({ ...form, fields });
};

export const updateConditionInField = (
  form: FormDefinition,
  fieldId: FieldIdT,
  conditionId: Condition['id'],
  patch: Partial<Omit<Condition, 'id'>>,
): FormDefinition => {
  const fields = form.fields.map((f) =>
    f.id === fieldId
      ? {
          ...f,
          conditions: f.conditions.map((c) =>
            c.id === conditionId ? { ...c, ...patch } : c,
          ),
        }
      : f,
  );
  return touch({ ...form, fields });
};
