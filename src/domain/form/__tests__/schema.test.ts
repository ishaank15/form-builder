import { describe, it, expect } from 'vitest';
import {
  createFormDefinition,
  createField,
  addField,
} from '@/domain/form/factories';
import { formDefinitionSchema } from '@/domain/form/schema';

describe('form schema round-trip', () => {
  it('parses a freshly-created form back to an equal value', () => {
    let f = createFormDefinition({ name: 'Onboarding' });
    f = addField(
      f,
      createField({
        kind: 'text',
        key: 'first_name',
        label: 'First name',
        config: { placeholder: 'Enter your name' },
      }),
    );
    const json = JSON.parse(JSON.stringify(f));
    const parsed = formDefinitionSchema.parse(json);
    expect(parsed.name).toBe('Onboarding');
    expect(parsed.fields).toHaveLength(1);
    expect(parsed.fields[0]!.kind).toBe('text');
  });

  it('rejects a missing schemaVersion', () => {
    const f = createFormDefinition({ name: 't' });
    const broken = { ...f, schemaVersion: undefined };
    const r = formDefinitionSchema.safeParse(broken);
    expect(r.success).toBe(false);
  });
});
