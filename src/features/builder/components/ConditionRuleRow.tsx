/**
 * One condition row: target field → operator → value → effect → remove.
 *
 * When the target field changes, we reset operator and value because the new target's
 * plugin advertises a different operator set; keeping a stale operator would either be
 * invalid or render with the wrong comparand input.
 */
import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { getPlugin, isKnownKind } from '@/platform/field-registry';
import { getOperator } from '@/platform/engines/conditions';
import type { AnyFieldDefinition } from '@/domain/form/types';
import type {
  Condition,
  ConditionEffect,
  OperatorId,
} from '@/domain/condition/types';
import type { FieldId, ConditionId } from '@/domain/id';
import { ConditionValueInput } from './ConditionValueInput';

interface Props {
  readonly condition: Condition;
  readonly fieldId: FieldId;
  readonly availableTargets: ReadonlyArray<AnyFieldDefinition>;
  readonly onUpdate: (
    fieldId: FieldId,
    conditionId: ConditionId,
    patch: Partial<Omit<Condition, 'id'>>,
  ) => void;
  readonly onRemove: (fieldId: FieldId, conditionId: ConditionId) => void;
}

const EFFECTS: { id: ConditionEffect; label: string }[] = [
  { id: 'show', label: 'Show this field' },
  { id: 'hide', label: 'Hide this field' },
  { id: 'markRequired', label: 'Mark as required' },
  { id: 'markNotRequired', label: 'Mark as not required' },
];

export const ConditionRuleRow = ({
  condition,
  fieldId,
  availableTargets,
  onUpdate,
  onRemove,
}: Props) => {
  const target = availableTargets.find((t) => t.id === condition.targetFieldId);
  const dangling = !target;

  const targetOperators: ReadonlyArray<OperatorId> =
    target && isKnownKind(target.kind) ? getPlugin(target.kind).operators : [];

  const handleTargetChange = (nextId: string) => {
    const nextTarget = availableTargets.find((t) => t.id === nextId);
    if (!nextTarget) return;
    const nextOps =
      isKnownKind(nextTarget.kind) ? getPlugin(nextTarget.kind).operators : [];
    onUpdate(fieldId, condition.id, {
      targetFieldId: nextTarget.id,
      operator: nextOps[0] ?? condition.operator,
      value: undefined,
    });
  };

  return (
    <div
      className={cn(
        'space-y-2 rounded-md border p-3',
        dangling ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white',
      )}
      data-condition-id={condition.id}
    >
      <div className="grid grid-cols-[1fr_auto] items-start gap-2">
        <div className="space-y-2">
          {/* Target field */}
          <select
            aria-label="Target field"
            value={condition.targetFieldId}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            {!target && (
              <option value={condition.targetFieldId}>
                (deleted field — pick a new target)
              </option>
            )}
            {availableTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label || t.key} · {t.kind}
              </option>
            ))}
          </select>

          {/* Operator */}
          <select
            aria-label="Operator"
            value={condition.operator}
            onChange={(e) =>
              onUpdate(fieldId, condition.id, {
                operator: e.target.value as OperatorId,
                value: undefined,
              })
            }
            disabled={!target || targetOperators.length === 0}
            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            {targetOperators.map((id) => {
              try {
                return (
                  <option key={id} value={id}>
                    {getOperator(id).label}
                  </option>
                );
              } catch {
                return null;
              }
            })}
          </select>

          {/* Value */}
          {target ? (
            <ConditionValueInput
              target={target}
              operator={condition.operator}
              value={condition.value}
              onChange={(next) => onUpdate(fieldId, condition.id, { value: next })}
            />
          ) : (
            <p className="text-xs text-amber-700">
              Target field no longer exists — select a different field above.
            </p>
          )}

          {/* Effect */}
          <select
            aria-label="Effect"
            value={condition.effect}
            onChange={(e) =>
              onUpdate(fieldId, condition.id, {
                effect: e.target.value as ConditionEffect,
              })
            }
            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            {EFFECTS.map((ef) => (
              <option key={ef.id} value={ef.id}>
                → {ef.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="ghost"
          onClick={() => onRemove(fieldId, condition.id)}
          aria-label="Remove condition"
        >
          ×
        </Button>
      </div>
    </div>
  );
};
