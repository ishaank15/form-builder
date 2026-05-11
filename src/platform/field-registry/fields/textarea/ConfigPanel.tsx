import { Input, Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { TextareaConfig } from './schema';

const numOrUndef = (s: string): number | undefined => {
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<TextareaConfig>) => {
  const set = <K extends keyof TextareaConfig>(key: K, v: TextareaConfig[K]) =>
    onChange({ ...config, [key]: v });

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="cfg-ta-placeholder">Placeholder</Label>
        <Input
          id="cfg-ta-placeholder"
          value={config.placeholder}
          onChange={(e) => set('placeholder', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-ta-min">Min length</Label>
          <Input
            id="cfg-ta-min"
            type="number"
            value={config.minLength ?? ''}
            onChange={(e) => set('minLength', numOrUndef(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="cfg-ta-max">Max length</Label>
          <Input
            id="cfg-ta-max"
            type="number"
            value={config.maxLength ?? ''}
            onChange={(e) => set('maxLength', numOrUndef(e.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="cfg-ta-rows">Visible rows</Label>
        <Input
          id="cfg-ta-rows"
          type="number"
          min={1}
          max={20}
          value={config.rows}
          onChange={(e) => set('rows', Math.max(1, Math.min(20, numOrUndef(e.target.value) ?? 3)))}
        />
      </div>
    </div>
  );
};
