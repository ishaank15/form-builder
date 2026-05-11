/**
 * Wires Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z (or Ctrl+Y) to the builder store's undo/redo.
 *
 * Used by the BuilderRoute. Skipped when focus is in an input/textarea so that the OS's
 * native input undo still works (a common annoyance with global shortcuts).
 */
import { useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
};

export const useUndoRedo = () => {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (isEditableTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
};
