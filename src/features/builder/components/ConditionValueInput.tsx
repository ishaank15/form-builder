/**
 * ConditionValueInput — renders the comparand input for a condition rule.
 *
 * The shape is determined by two things:
 *   - The OPERATOR's comparandKind (value | range | list | none) — registered with the operator
 *   - The TARGET FIELD's plugin kind — determines what kind of "value" is meaningful
 *     (e.g. a single-select target's value is an option id; a number target's value is a number)
 *
 * For unsupported combinations (or missing operators), we render a generic text input.
 * That keeps the editor robust to future operator additions without breaking.
 */
import { useMemo } from 'react';
import { Input } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { getOperator } from '@/platform/engines/conditions';
import { getPlugin, isKnownKind, type FieldKind } from '@/platform/field-registry';
import type { AnyFieldDefinition } from '@/domain/form/types';
import type { OperatorId } from '@/domain/condition/types';

interface Props {
  readonly target: AnyFieldDefinition;
  readonly operator: OperatorId;
  readonly value: unknown;
  readonly onChange: (next: unknown) => void;
}

const numOrUndef = (s: string): number | undefined => {
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** Pull the option list from a single/multi-select target's config. */
const optionsOf = (target: AnyFieldDefinition): { id: string; label: string }[] => {
  const cfg = target.config as { options?: { id: string; label: string }[] } | undefined;
  return Array.isArray(cfg?.options) ? cfg.options : [];
};

export const ConditionValueInput = ({ target, operator, value, onChange }: Props) => {
  const op = useMemo(() => {
    try {
      return getOperator(operator);
    } catch {
      return null;
    }
  }, [operator]);

  if (!op) {
    return (
      <Input
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      />
    );
  }

  if (op.comparandKind === 'none') {
    return <span className="text-xs italic text-slate-400">no value needed</span>;
  }

  const targetKind: FieldKind | null = isKnownKind(target.kind) ? target.kind : null;

  // Range — pair of numbers
  if (op.comparandKind === 'range') {
    const arr = Array.isArray(value) ? (value as unknown[]) : [];
    const lo = typeof arr[0] === 'number' ? (arr[0] as number) : undefined;
    const hi = typeof arr[1] === 'number' ? (arr[1] as number) : undefined;
    return (
      <div className="flex items-center gap-2">
        <Input
          aria-label="Low end"
          type="number"
          value={lo ?? ''}
          onChange={(e) => onChange([numOrUndef(e.target.value), hi])}
          className="w-24"
        />
        <span className="text-xs text-slate-400">to</span>
        <Input
          aria-label="High end"
          type="number"
          value={hi ?? ''}
          onChange={(e) => onChange([lo, numOrUndef(e.target.value)])}
          className="w-24"
        />
      </div>
    );
  }

  // List — pick from target's option list (multi-select targets)
  if (op.comparandKind === 'list') {
    const opts = optionsOf(target);
    const selected = new Set(Array.isArray(value) ? (value as string[]) : []);
    const toggle = (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange([...next]);
    };
    if (opts.length === 0) {
      return <p className="text-xs italic text-slate-400">target field has no options</p>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {opts.map((o) => {
          const active = selected.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={cn(
                'rounded border px-2 py-0.5 text-xs',
                active
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Value — depends on target's value type
  if (targetKind === 'number') {
    return (
      <Input
        type="number"
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(numOrUndef(e.target.value))}
      />
    );
  }
  if (targetKind === 'date') {
    return (
      <Input
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      />
    );
  }
  if (targetKind === 'singleSelect') {
    const opts = optionsOf(target);
    return (
      <select
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  // text / textarea / fallback
  return (
    <Input
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      placeholder={
        targetKind && getPlugin(targetKind).label.toLowerCase() === 'date'
          ? 'yyyy-mm-dd'
          : 'value'
      }
    />
  );
};
