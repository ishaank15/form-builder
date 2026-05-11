/**
 * Builder store — holds the in-progress draft template + undo/redo history.
 *
 * Every mutation routes through `apply()`, which (a) snapshots the current draft into
 * `past`, (b) clears `future`, (c) applies the update. Snapshots are cheap because
 * `FormDefinition` factories are pure and structurally share unchanged subtrees with
 * their predecessors — pushing a reference is sufficient.
 *
 * History bounded to 50 steps to cap memory in long sessions. Tests cover undo/redo
 * semantics including the "branch on edit after undo" behavior (future is cleared).
 */
import { create } from 'zustand';
import type { FormDefinition, AnyFieldDefinition } from '@/domain/form/types';
import type { FieldId, ConditionId } from '@/domain/id';
import type { Condition } from '@/domain/condition/types';
import {
  addField as addFieldF,
  removeField as removeFieldF,
  updateField as updateFieldF,
  reorderFields as reorderFieldsF,
  addConditionToField as addConditionToFieldF,
  removeConditionFromField as removeConditionFromFieldF,
  updateConditionInField as updateConditionInFieldF,
} from '@/domain/form/factories';

const HISTORY_LIMIT = 50;

interface BuilderState {
  readonly draft: FormDefinition | null;
  readonly past: ReadonlyArray<FormDefinition>;
  readonly future: ReadonlyArray<FormDefinition>;
  readonly selectedFieldId: FieldId | null;

  readonly load: (form: FormDefinition) => void;
  readonly addField: (field: AnyFieldDefinition) => void;
  readonly removeField: (id: FieldId) => void;
  readonly updateField: (id: FieldId, patch: Partial<AnyFieldDefinition>) => void;
  readonly reorderFields: (from: number, to: number) => void;
  readonly addCondition: (fieldId: FieldId, condition: Condition) => void;
  readonly removeCondition: (fieldId: FieldId, conditionId: ConditionId) => void;
  readonly updateCondition: (
    fieldId: FieldId,
    conditionId: ConditionId,
    patch: Partial<Omit<Condition, 'id'>>,
  ) => void;
  readonly select: (id: FieldId | null) => void;
  readonly setMeta: (patch: { name?: string; description?: string }) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly canUndo: () => boolean;
  readonly canRedo: () => boolean;
  readonly clear: () => void;
}

const pushPast = (
  past: ReadonlyArray<FormDefinition>,
  current: FormDefinition,
): ReadonlyArray<FormDefinition> => {
  const next = past.length >= HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT + 1) : past;
  return [...next, current];
};

export const useBuilderStore = create<BuilderState>((set, get) => {
  /** Wrap a mutation: snapshot the current draft to past, clear future, apply update. */
  const apply = (
    updater: (draft: FormDefinition) => FormDefinition,
    patch: Partial<BuilderState> = {},
  ) =>
    set((s) => {
      if (!s.draft) return s;
      return {
        past: pushPast(s.past, s.draft),
        future: [],
        draft: updater(s.draft),
        ...patch,
      };
    });

  return {
    draft: null,
    past: [],
    future: [],
    selectedFieldId: null,

    load: (form) =>
      set({ draft: form, past: [], future: [], selectedFieldId: null }),

    addField: (field) =>
      apply(
        (draft) => addFieldF(draft, field),
        { selectedFieldId: field.id },
      ),

    removeField: (id) =>
      set((s) => {
        if (!s.draft) return s;
        return {
          past: pushPast(s.past, s.draft),
          future: [],
          draft: removeFieldF(s.draft, id),
          selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
        };
      }),

    updateField: (id, patch) => apply((draft) => updateFieldF(draft, id, patch)),

    reorderFields: (from, to) => apply((draft) => reorderFieldsF(draft, from, to)),

    addCondition: (fieldId, condition) =>
      apply((draft) => addConditionToFieldF(draft, fieldId, condition)),

    removeCondition: (fieldId, conditionId) =>
      apply((draft) => removeConditionFromFieldF(draft, fieldId, conditionId)),

    updateCondition: (fieldId, conditionId, patch) =>
      apply((draft) => updateConditionInFieldF(draft, fieldId, conditionId, patch)),

    select: (id) => set({ selectedFieldId: id }),

    setMeta: (patch) =>
      apply((draft) => ({
        ...draft,
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        updatedAt: new Date().toISOString(),
      })),

    undo: () =>
      set((s) => {
        if (!s.draft || s.past.length === 0) return s;
        const prev = s.past[s.past.length - 1]!;
        return {
          draft: prev,
          past: s.past.slice(0, -1),
          future: [s.draft, ...s.future],
        };
      }),

    redo: () =>
      set((s) => {
        if (!s.draft || s.future.length === 0) return s;
        const next = s.future[0]!;
        return {
          draft: next,
          past: pushPast(s.past, s.draft),
          future: s.future.slice(1),
        };
      }),

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    clear: () => set({ draft: null, past: [], future: [], selectedFieldId: null }),
  };
});
