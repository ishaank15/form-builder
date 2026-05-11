import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '@/features/builder';
import {
  createFormDefinition,
  createField,
  createCondition,
} from '@/domain/form/factories';

const text = (key: string) =>
  createField({
    kind: 'text',
    key,
    label: key,
    config: { placeholder: '', prefix: '', suffix: '' },
  });

beforeEach(() => {
  useBuilderStore.getState().clear();
});

describe('builder conditions actions', () => {
  it('addCondition appends to the field and is undoable', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().addField(text('b'));
    const a = useBuilderStore.getState().draft!.fields[0]!;
    const b = useBuilderStore.getState().draft!.fields[1]!;
    useBuilderStore.getState().addCondition(
      b.id,
      createCondition({
        targetFieldId: a.id,
        operator: 'eq',
        value: 'x',
        effect: 'show',
      }),
    );
    const state = useBuilderStore.getState();
    expect(state.draft!.fields[1]!.conditions).toHaveLength(1);
    state.undo();
    expect(useBuilderStore.getState().draft!.fields[1]!.conditions).toHaveLength(0);
  });

  it('updateCondition patches in place, preserving id and order', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().addField(text('b'));
    const a = useBuilderStore.getState().draft!.fields[0]!;
    const b = useBuilderStore.getState().draft!.fields[1]!;
    const c = createCondition({
      targetFieldId: a.id,
      operator: 'eq',
      value: 'x',
      effect: 'show',
    });
    useBuilderStore.getState().addCondition(b.id, c);
    useBuilderStore.getState().updateCondition(b.id, c.id, {
      operator: 'contains',
      value: 'foo',
    });
    const updated = useBuilderStore.getState().draft!.fields[1]!.conditions[0]!;
    expect(updated.id).toBe(c.id);
    expect(updated.operator).toBe('contains');
    expect(updated.value).toBe('foo');
    expect(updated.effect).toBe('show'); // unchanged
  });

  it('removeCondition deletes only the specified condition', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().addField(text('b'));
    const a = useBuilderStore.getState().draft!.fields[0]!;
    const b = useBuilderStore.getState().draft!.fields[1]!;
    const c1 = createCondition({
      targetFieldId: a.id,
      operator: 'eq',
      value: 'x',
      effect: 'show',
    });
    const c2 = createCondition({
      targetFieldId: a.id,
      operator: 'neq',
      value: 'y',
      effect: 'hide',
    });
    useBuilderStore.getState().addCondition(b.id, c1);
    useBuilderStore.getState().addCondition(b.id, c2);
    useBuilderStore.getState().removeCondition(b.id, c1.id);
    const remaining = useBuilderStore.getState().draft!.fields[1]!.conditions;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.id).toBe(c2.id);
  });
});
