/**
 * Filler store — owns ONLY the user's input state.
 *
 * Visibility, required-state, computed values, and errors are NOT stored here. They are
 * derived per render in `useFormState`, calling the engines. Storing derived state would
 * cause stale-state bugs and duplicate the engines' logic.
 *
 * The store is intentionally not persisted — fill state is per-session. On submit we
 * convert it into an immutable Submission via `buildSubmission()`.
 */
import { create } from 'zustand';
import type { FieldId } from '@/domain/id';

interface FillerState {
  readonly values: Readonly<Record<string, unknown>>;
  readonly touched: Readonly<Record<string, boolean>>;
  readonly setValue: (id: FieldId, value: unknown) => void;
  readonly setTouched: (id: FieldId) => void;
  readonly setMany: (initial: Readonly<Record<string, unknown>>) => void;
  readonly reset: () => void;
}

export const useFillerStore = create<FillerState>((set) => ({
  values: {},
  touched: {},
  setValue: (id, value) =>
    set((s) => {
      // Setting undefined removes the key entirely so downstream `Object.hasOwn` is honest.
      const next = { ...s.values };
      if (value === undefined) delete next[id];
      else next[id] = value;
      return { values: next };
    }),
  setTouched: (id) =>
    set((s) => ({ touched: { ...s.touched, [id]: true } })),
  setMany: (initial) =>
    set(() => ({ values: { ...initial }, touched: {} })),
  reset: () => set({ values: {}, touched: {} }),
}));
