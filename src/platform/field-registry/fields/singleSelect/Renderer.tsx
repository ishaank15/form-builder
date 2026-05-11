/**
 * Single Select renderer with three display modes (radio / dropdown / tiles).
 *
 * The same underlying value semantics apply across modes — only the visual presentation
 * changes. Switching mode in the builder must not change the field's value or required
 * validation behavior. Tested in the contract.
 */
import { cn } from '@/shared/lib/cn';
import type { RendererProps } from '../../types';
import type { SingleSelectConfig } from './schema';

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: RendererProps<SingleSelectConfig, string>) => {
  const select = (next: string) => {
    if (disabled || readOnly) return;
    onChange(next === value ? undefined : next);
  };

  if (config.displayMode === 'dropdown') {
    return (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition',
          'focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10',
          error ? 'border-red-500' : 'border-slate-300',
        )}
      >
        <option value="">Select…</option>
        {config.options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (config.displayMode === 'radio') {
    return (
      <div className="space-y-2" onBlur={onBlur}>
        {config.options.map((o) => {
          const checked = value === o.id;
          return (
            <label
              key={o.id}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                checked ? 'border-slate-900 bg-slate-50' : 'border-slate-200',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(o.id)}
                className="h-4 w-4 accent-slate-900"
              />
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  // tiles
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" onBlur={onBlur}>
      {config.options.map((o) => {
        const checked = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            onClick={() => select(o.id)}
            className={cn(
              'rounded-lg border px-3 py-3 text-center text-sm font-medium transition',
              checked
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};
