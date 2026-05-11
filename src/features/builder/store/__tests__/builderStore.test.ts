/**
 * Builder store undo/redo semantics. The store is global (zustand singleton); each test
 * resets it via `clear()` so order-independent.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '@/features/builder';
import { createFormDefinition, createField } from '@/domain/form/factories';

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

describe('builderStore', () => {
  it('load initializes draft and clears history', () => {
    const f = createFormDefinition({ name: 'A' });
    useBuilderStore.getState().load(f);
    const s = useBuilderStore.getState();
    expect(s.draft?.id).toBe(f.id);
    expect(s.past).toHaveLength(0);
    expect(s.future).toHaveLength(0);
  });

  it('addField pushes to past, clears future', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    const s = useBuilderStore.getState();
    expect(s.draft?.fields).toHaveLength(1);
    expect(s.past).toHaveLength(1);
    expect(s.future).toHaveLength(0);
  });

  it('undo restores the previous draft and pushes current to future', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().undo();
    const s = useBuilderStore.getState();
    expect(s.draft?.fields).toHaveLength(0);
    expect(s.past).toHaveLength(0);
    expect(s.future).toHaveLength(1);
  });

  it('redo restores the undone draft', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().undo();
    useBuilderStore.getState().redo();
    const s = useBuilderStore.getState();
    expect(s.draft?.fields).toHaveLength(1);
    expect(s.future).toHaveLength(0);
  });

  it('mutating after an undo discards the future (branch)', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().future).toHaveLength(1);
    useBuilderStore.getState().addField(text('b'));
    expect(useBuilderStore.getState().future).toHaveLength(0);
  });

  it('undo with empty past is a no-op', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    const before = useBuilderStore.getState().draft;
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().draft).toBe(before);
  });

  it('redo with empty future is a no-op', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    const after = useBuilderStore.getState().draft;
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().draft).toBe(after);
  });

  it('reorderFields mutates and is undoable', () => {
    useBuilderStore.getState().load(createFormDefinition({ name: 'A' }));
    useBuilderStore.getState().addField(text('a'));
    useBuilderStore.getState().addField(text('b'));
    useBuilderStore.getState().addField(text('c'));
    const orderedKeys = useBuilderStore.getState().draft!.fields.map((f) => f.key);
    expect(orderedKeys).toEqual(['a', 'b', 'c']);
    useBuilderStore.getState().reorderFields(0, 2);
    expect(useBuilderStore.getState().draft!.fields.map((f) => f.key)).toEqual([
      'b',
      'c',
      'a',
    ]);
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().draft!.fields.map((f) => f.key)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
