/**
 * Calculation renderer — read-only display of the computed value.
 *
 * The engine writes the computed value into the form state in `useFormState`, so by the
 * time this Renderer runs, `value` is the up-to-date aggregation result. We display it
 * formatted with the configured precision.
 */
import type { RendererProps } from '../../types';
import type { CalculationPluginConfig } from './schema';

export const Renderer = ({ config, value }: RendererProps<CalculationPluginConfig, number>) => {
  const display =
    typeof value === 'number' && Number.isFinite(value)
      ? value.toFixed(config.precision)
      : '—';
  return (
    <div
      className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm tabular-nums"
      data-readonly
    >
      <span className="font-mono text-slate-900">{display}</span>
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {config.aggregator.toLowerCase()} of {config.sources.length} field
        {config.sources.length === 1 ? '' : 's'}
      </span>
    </div>
  );
};
