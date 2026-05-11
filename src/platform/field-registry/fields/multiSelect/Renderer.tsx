import { cn } from '@/shared/lib/cn';
import type { RendererProps } from '../../types';
import type { MultiSelectConfig } from './schema';

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  disabled,
  readOnly,
}: RendererProps<MultiSelectConfig, string[]>) => {
  const selected = new Set(Array.isArray(value) ? value : []);

  const toggle = (id: string) => {
    if (disabled || readOnly) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const arr = [...next];
    onChange(arr.length === 0 ? undefined : arr);
  };

  return (
    <div className="space-y-1.5" onBlur={onBlur}>
      {config.options.map((o) => {
        const checked = selected.has(o.id);
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
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(o.id)}
              className="h-4 w-4 accent-slate-900"
            />
            <span>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
};
