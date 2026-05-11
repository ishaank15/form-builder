import { Input, Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { NumberConfig } from './schema';

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<NumberConfig>) => {
  const set = <K extends keyof NumberConfig>(key: K, v: NumberConfig[K]) =>
    onChange({ ...config, [key]: v });

  const numOrUndef = (s: string): number | undefined => {
    if (s === '') return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-num-min">Min value</Label>
          <Input
            id="cfg-num-min"
            type="number"
            value={config.min ?? ''}
            onChange={(e) => set('min', numOrUndef(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="cfg-num-max">Max value</Label>
          <Input
            id="cfg-num-max"
            type="number"
            value={config.max ?? ''}
            onChange={(e) => set('max', numOrUndef(e.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="cfg-num-decimals">Decimals (0–4)</Label>
        <Input
          id="cfg-num-decimals"
          type="number"
          min={0}
          max={4}
          value={config.decimals}
          onChange={(e) => {
            const n = numOrUndef(e.target.value) ?? 0;
            set('decimals', Math.max(0, Math.min(4, Math.trunc(n))));
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-num-prefix">Prefix</Label>
          <Input
            id="cfg-num-prefix"
            value={config.prefix}
            onChange={(e) => set('prefix', e.target.value)}
            placeholder="$"
          />
        </div>
        <div>
          <Label htmlFor="cfg-num-suffix">Suffix</Label>
          <Input
            id="cfg-num-suffix"
            value={config.suffix}
            onChange={(e) => set('suffix', e.target.value)}
            placeholder="kg"
          />
        </div>
      </div>
    </div>
  );
};
