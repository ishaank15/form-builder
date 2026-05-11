/**
 * ConditionsEditor — per-field. Renders the list of conditions in declaration order
 * (which matches the engine's evaluation order) with an "Add condition" button below.
 *
 * Combination policy reminder: when a field has multiple conditions, the LAST active
 * one wins per axis (visibility / required). The order in this list is the order of
 * evaluation; the help text below the list explains this.
 */
import { Button } from '@/shared/ui';
import { useBuilderStore } from '../store/builderStore';
import { createCondition } from '@/domain/form/factories';
import { getPlugin, isKnownKind } from '@/platform/field-registry';
import type { AnyFieldDefinition } from '@/domain/form/types';
import type { OperatorId } from '@/domain/condition/types';
import { ConditionRuleRow } from './ConditionRuleRow';

interface Props {
  readonly field: AnyFieldDefinition;
}

const firstOperatorFor = (target: AnyFieldDefinition): OperatorId | null => {
  if (!isKnownKind(target.kind)) return null;
  const ops = getPlugin(target.kind).operators;
  return ops[0] ?? null;
};

export const ConditionsEditor = ({ field }: Props) => {
  const draft = useBuilderStore((s) => s.draft);
  const addCondition = useBuilderStore((s) => s.addCondition);
  const removeCondition = useBuilderStore((s) => s.removeCondition);
  const updateCondition = useBuilderStore((s) => s.updateCondition);

  if (!draft) return null;

  // Eligible targets: every other field in the form that has at least one operator.
  const targets = draft.fields.filter((f) => {
    if (f.id === field.id) return false; // no self-reference (spec)
    if (!isKnownKind(f.kind)) return false;
    return getPlugin(f.kind).operators.length > 0;
  });

  const handleAdd = () => {
    const target = targets[0];
    if (!target) return;
    const op = firstOperatorFor(target);
    if (!op) return;
    addCondition(
      field.id,
      createCondition({
        targetFieldId: target.id,
        operator: op,
        value: undefined,
        effect: 'show',
      }),
    );
  };

  return (
    <div className="space-y-3">
      {field.conditions.length === 0 ? (
        <p className="text-xs text-slate-500">
          No conditions. The field uses its default visibility and required state.
        </p>
      ) : (
        <ul className="space-y-2">
          {field.conditions.map((c) => (
            <li key={c.id}>
              <ConditionRuleRow
                condition={c}
                fieldId={field.id}
                availableTargets={targets}
                onUpdate={updateCondition}
                onRemove={removeCondition}
              />
            </li>
          ))}
        </ul>
      )}

      <Button variant="secondary" onClick={handleAdd} disabled={targets.length === 0}>
        + Add condition
      </Button>

      {targets.length === 0 && field.conditions.length === 0 && (
        <p className="text-xs italic text-slate-400">
          Add another field to this form to set up conditions.
        </p>
      )}

      {field.conditions.length > 1 && (
        <p className="text-xs text-slate-500">
          When multiple conditions are active, the last matching condition wins per axis
          (visibility, required). Reorder by deleting and re-adding.
        </p>
      )}
    </div>
  );
};
