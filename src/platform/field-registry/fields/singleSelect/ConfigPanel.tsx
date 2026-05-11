import { useId } from 'react';
import { Button, Input, Label } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { ConfigPanelProps } from '../../types';
import type { SingleSelectConfig, DisplayMode, SelectOption } from './schema';

const MODES: { id: DisplayMode; label: string }[] = [
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'radio', label: 'Radio' },
  { id: 'tiles', label: 'Tiles' },
];

const newOption = (): SelectOption => ({
  id: `opt_${Math.random().toString(36).slice(2, 8)}`,
  label: '',
});

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<SingleSelectConfig>) => {
  const idBase = useId();

  const updateOption = (idx: number, patch: Partial<SelectOption>) => {
    const opts = config.options.map((o, i) => (i === idx ? { ...o, ...patch } : o));
    onChange({ ...config, options: opts });
  };

  const removeOption = (idx: number) => {
    if (config.options.length <= 1) return;
    onChange({ ...config, options: config.options.filter((_, i) => i !== idx) });
  };

  const addOption = () => onChange({ ...config, options: [...config.options, newOption()] });

  const moveOption = (from: number, to: number) => {
    if (from === to || to < 0 || to >= config.options.length) return;
    const next = [...config.options];
    const item = next[from];
    if (!item) return;
    next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ ...config, options: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Display mode</Label>
        <div className="mt-1 inline-flex rounded-md border border-slate-200 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ ...config, displayMode: m.id })}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium',
                config.displayMode === m.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          <Button variant="secondary" onClick={addOption}>
            + Add
          </Button>
        </div>
        <ul className="mt-2 space-y-2">
          {config.options.map((o, i) => (
            <li key={o.id} className="flex items-center gap-2">
              <Input
                aria-label={`Option ${i + 1} label`}
                id={`${idBase}-opt-${i}`}
                value={o.label}
                onChange={(e) => updateOption(i, { label: e.target.value })}
              />
              <Button
                variant="ghost"
                onClick={() => moveOption(i, i - 1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                onClick={() => moveOption(i, i + 1)}
                disabled={i === config.options.length - 1}
                aria-label="Move down"
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                onClick={() => removeOption(i)}
                disabled={config.options.length <= 1}
                aria-label="Remove"
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
