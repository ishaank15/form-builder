/**
 * Calculation config panel — the only ConfigPanel that uses the optional `form` context.
 *
 * Source picker enumerates aggregable fields (Number) excluding self. Calc-on-calc is
 * forbidden by spec; we filter to `isAggregable: true`, which the calculation plugin
 * itself sets to false, naturally excluding other calc fields.
 */
import { Input, Label } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { allAggregators } from '@/platform/engines/calculations';
import { isKnownKind, getPlugin } from '../../registry';
import type { ConfigPanelProps } from '../../types';
import type { CalculationPluginConfig } from './schema';
import type { AggregatorId } from '@/domain/calculation/types';
import type { FieldId } from '@/domain/id';

export const ConfigPanel = ({
  config,
  onChange,
  form,
}: ConfigPanelProps<CalculationPluginConfig>) => {
  const aggregableFields =
    form?.fields.filter((f) => {
      if (f.id === form.selfId) return false;
      if (!isKnownKind(f.kind)) return false;
      return getPlugin(f.kind).isAggregable;
    }) ?? [];

  const toggleSource = (id: FieldId) => {
    const has = config.sources.includes(id);
    onChange({
      ...config,
      sources: has ? config.sources.filter((s) => s !== id) : [...config.sources, id],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cfg-calc-agg">Aggregation</Label>
        <select
          id="cfg-calc-agg"
          value={config.aggregator}
          onChange={(e) => onChange({ ...config, aggregator: e.target.value as AggregatorId })}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {allAggregators().map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="cfg-calc-prec">Decimal places</Label>
        <Input
          id="cfg-calc-prec"
          type="number"
          min={0}
          max={4}
          value={config.precision}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange({
              ...config,
              precision: Number.isFinite(n) ? Math.max(0, Math.min(4, Math.trunc(n))) : 2,
            });
          }}
        />
      </div>

      <div>
        <Label>Source fields</Label>
        {aggregableFields.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">
            Add a Number field to this form to use as a calculation source.
          </p>
        ) : (
          <ul className="mt-1 space-y-1">
            {aggregableFields.map((f) => {
              const checked = config.sources.includes(f.id);
              return (
                <li key={f.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                      checked ? 'border-slate-900 bg-slate-50' : 'border-slate-200',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSource(f.id)}
                      className="h-4 w-4 accent-slate-900"
                    />
                    <span className="truncate">{f.label || f.key}</span>
                    <span className="ml-auto text-xs text-slate-400">{f.kind}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
