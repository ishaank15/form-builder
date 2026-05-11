import { describe, it, expect, beforeEach } from 'vitest';
import { templatesService } from '@/services/templates';
import { submissionsService } from '@/services/submissions';
import { createFormDefinition, createField, addField } from '@/domain/form/factories';
import { buildSubmission } from '@/domain/submission/builder';
import { persistence } from '@/platform/persistence';

beforeEach(() => {
  persistence.clearNamespace();
});

describe('templatesService', () => {
  it('save → list returns the saved form', () => {
    const f = createFormDefinition({ name: 'A' });
    templatesService.save(f);
    const list = templatesService.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(f.id);
  });

  it('get returns the saved form by id', () => {
    const f = createFormDefinition({ name: 'A' });
    templatesService.save(f);
    expect(templatesService.get(f.id)?.name).toBe('A');
  });

  it('save → reload (simulated) returns the same data', () => {
    let f = createFormDefinition({ name: 'Onboarding' });
    f = addField(
      f,
      createField({
        kind: 'text',
        key: 'name',
        label: 'Name',
        config: { placeholder: '', prefix: '', suffix: '' },
      }),
    );
    templatesService.save(f);
    // Simulate reload: a fresh service call has no in-memory state; it reads storage anew.
    const list = templatesService.list();
    expect(list[0]?.fields).toHaveLength(1);
    expect(list[0]?.fields[0]?.kind).toBe('text');
  });

  it('remove deletes a template by id', () => {
    const f = createFormDefinition({ name: 'A' });
    templatesService.save(f);
    templatesService.remove(f.id);
    expect(templatesService.get(f.id)).toBeNull();
  });
});

describe('submissionsService', () => {
  it('byTemplate filters submissions to one template', () => {
    const a = createFormDefinition({ name: 'A' });
    const b = createFormDefinition({ name: 'B' });
    submissionsService.save(
      buildSubmission({ form: a, state: { values: {}, touched: {} }, visibility: new Map() }),
    );
    submissionsService.save(
      buildSubmission({ form: b, state: { values: {}, touched: {} }, visibility: new Map() }),
    );
    expect(submissionsService.byTemplate(a.id)).toHaveLength(1);
    expect(submissionsService.byTemplate(b.id)).toHaveLength(1);
  });
});
