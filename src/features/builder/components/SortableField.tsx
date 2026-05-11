/**
 * SortableField — a single canvas card wired to @dnd-kit's useSortable.
 *
 * Drag-handle pattern: only the grip icon is wired with `listeners`, so clicking the
 * card body still selects the field. This is the difference between "drag the card" and
 * "drag a handle" — the latter is the SaaS-grade UX.
 */
import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib/cn';

interface Props {
  readonly id: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly children: ReactNode;
}

export const SortableField = ({ id, selected, onSelect, children }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-stretch gap-2 rounded-lg border bg-white p-4 transition',
        selected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300',
        isDragging && 'opacity-60 shadow-lg',
      )}
      data-field-id={id}
    >
      <button
        type="button"
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
        className="flex w-5 cursor-grab items-center justify-center text-slate-400 hover:text-slate-700 active:cursor-grabbing"
      >
        <span aria-hidden>⋮⋮</span>
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};
