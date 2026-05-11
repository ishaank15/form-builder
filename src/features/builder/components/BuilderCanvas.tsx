/**
 * BuilderCanvas — drag-and-drop list of fields.
 *
 * Uses @dnd-kit with a vertical sorting strategy. Pointer + keyboard sensors are both
 * enabled so the builder is keyboard-accessible (Tab to a card, Space to pick up,
 * arrow keys to move).
 */
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/shared/ui';
import { useBuilderStore } from '../store/builderStore';
import { SortableField } from './SortableField';

export const BuilderCanvas = () => {
  const draft = useBuilderStore((s) => s.draft);
  const selectedFieldId = useBuilderStore((s) => s.selectedFieldId);
  const select = useBuilderStore((s) => s.select);
  const removeField = useBuilderStore((s) => s.removeField);
  const reorderFields = useBuilderStore((s) => s.reorderFields);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!draft) return null;
  if (draft.fields.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Add a field from the left panel to start building this form.
        </p>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = draft.fields.findIndex((f) => f.id === active.id);
    const to = draft.fields.findIndex((f) => f.id === over.id);
    if (from < 0 || to < 0) return;
    reorderFields(from, to);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={draft.fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {draft.fields.map((f) => (
            <SortableField
              key={f.id}
              id={f.id}
              selected={f.id === selectedFieldId}
              onSelect={() => select(f.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{f.kind}</p>
                  <p className="truncate text-sm font-medium text-slate-900">
                    {f.label || <span className="italic text-slate-400">Untitled</span>}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">{f.key}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    onClick={() => removeField(f.id)}
                    aria-label="Delete field"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </SortableField>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
