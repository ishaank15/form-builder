import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { templatesService } from '@/services';
import { validateForm, type Issue } from '@/domain/form/invariants';
import { useBuilderStore } from '../store/builderStore';
import type { FieldId } from '@/domain/id';

/**
 * Two-stage save:
 *   1. Run invariants. If any error, surface inline; do not proceed.
 *   2. If only warnings, open the modal so the builder sees the affected fields and
 *      consciously chooses to ship the form anyway. Cycles are the most consequential
 *      class of warnings; the modal lists the cycle path with field labels.
 */
export const BuilderToolbar = () => {
  const navigate = useNavigate();
  const draft = useBuilderStore((s) => s.draft);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const past = useBuilderStore((s) => s.past);
  const future = useBuilderStore((s) => s.future);
  const [errors, setErrors] = useState<ReadonlyArray<Issue>>([]);
  const [warningModal, setWarningModal] = useState<{
    open: boolean;
    issues: ReadonlyArray<Issue>;
  }>({ open: false, issues: [] });

  if (!draft) return null;

  const labelOf = (id: FieldId): string => {
    const f = draft.fields.find((x) => x.id === id);
    return f?.label || f?.key || 'unnamed field';
  };

  const proceedWithSave = () => {
    templatesService.save(draft);
    navigate('/');
  };

  const handleSave = () => {
    const r = validateForm(draft);
    const errs = r.issues.filter((i) => i.severity === 'error');
    const warns = r.issues.filter((i) => i.severity === 'warning');
    setErrors(errs);
    if (errs.length > 0) return; // fix errors first
    if (warns.length > 0) {
      setWarningModal({ open: true, issues: warns });
      return;
    }
    proceedWithSave();
  };

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Input
            aria-label="Template name"
            value={draft.name}
            onChange={(e) => setMeta({ name: e.target.value })}
            className="max-w-md text-base font-semibold"
            placeholder="Untitled form"
          />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={undo}
              disabled={past.length === 0}
              aria-label="Undo"
              title="Undo (⌘Z)"
            >
              ↶
            </Button>
            <Button
              variant="ghost"
              onClick={redo}
              disabled={future.length === 0}
              aria-label="Redo"
              title="Redo (⇧⌘Z)"
            >
              ↷
            </Button>
            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
            <Button variant="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/builder/${draft.id}/preview`)}
              disabled={draft.fields.length === 0}
            >
              Preview
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
        {errors.length > 0 && (
          <ul className="text-xs text-red-600">
            {errors.map((iss, i) => (
              <li key={i}>• {iss.message}</li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={warningModal.open}
        title={
          warningModal.issues.some((i) => i.code === 'visibility_cycle')
            ? 'Visibility cycle detected'
            : 'Issues to review'
        }
        confirmLabel="Save anyway"
        confirmVariant="danger"
        cancelLabel="Go back and fix"
        onCancel={() => setWarningModal({ open: false, issues: [] })}
        onConfirm={() => {
          setWarningModal({ open: false, issues: [] });
          proceedWithSave();
        }}
      >
        <div className="space-y-3">
          {warningModal.issues.some((i) => i.code === 'visibility_cycle') && (
            <p>
              Two or more fields&apos; visibility depends on each other in a loop. If every
              field in the loop defaults to <em>hidden</em>, the form is unreachable in fill
              mode — neither field can ever appear because neither has a value to drive the
              other&apos;s condition.
            </p>
          )}
          <ul className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {warningModal.issues.map((iss, i) => {
              if (iss.code === 'visibility_cycle' && iss.detail?.cycle) {
                const path = iss.detail.cycle.map(labelOf).join(' ↔ ');
                return (
                  <li key={i}>
                    <p className="font-medium">Visibility cycle</p>
                    <p className="mt-0.5">
                      <span className="font-mono">{path}</span>
                    </p>
                  </li>
                );
              }
              return <li key={i}>{iss.message}</li>;
            })}
          </ul>
          <p className="text-xs text-slate-500">
            You can save anyway if this is intentional (for instance, the cycle relies on
            a field defaulting to visible). Otherwise, edit the affected conditions and try
            again.
          </p>
        </div>
      </ConfirmDialog>
    </>
  );
};
