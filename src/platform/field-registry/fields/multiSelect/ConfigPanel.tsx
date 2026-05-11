import { Button, Input, Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { MultiSelectConfig, MultiSelectOption } from './schema';

const newOption = (): MultiSelectOption => ({
  id: `opt_${Math.random().toString(36).slice(2, 8)}`,
  label: '',
});

const numOrUndef = (s: string): number | undefined => {
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<MultiSelectConfig>) => {
  const updateOption = (idx: number, patch: Partial<MultiSelectOption>) => {
    const opts = config.options.map((o, i) => (i === idx ? { ...o, ...patch } : o));
    onChange({ ...config, options: opts });
  };
  const removeOption = (idx: number) => {
    if (config.options.length <= 1) return;
    onChange({ ...config, options: config.options.filter((_, i) => i !== idx) });
  };
  const addOption = () => onChange({ ...config, options: [...config.options, newOption()] });

  return (
    <div className="space-y-4">
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
                value={o.label}
                onChange={(e) => updateOption(i, { label: e.target.value })}
              />
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-ms-min">Min selections</Label>
          <Input
            id="cfg-ms-min"
            type="number"
            value={config.minSelections ?? ''}
            onChange={(e) =>
              onChange({ ...config, minSelections: numOrUndef(e.target.value) })
            }
          />
        </div>
        <div>
          <Label htmlFor="cfg-ms-max">Max selections</Label>
          <Input
            id="cfg-ms-max"
            type="number"
            value={config.maxSelections ?? ''}
            onChange={(e) =>
              onChange({ ...config, maxSelections: numOrUndef(e.target.value) })
            }
          />
        </div>
      </div>
    </div>
  );
};
