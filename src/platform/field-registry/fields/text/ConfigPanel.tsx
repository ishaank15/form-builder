import { Input, Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { TextConfig } from './schema';

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<TextConfig>) => {
  const set = <K extends keyof TextConfig>(key: K, v: TextConfig[K]) =>
    onChange({ ...config, [key]: v });

  const numOrUndef = (s: string): number | undefined => {
    if (s === '') return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="cfg-placeholder">Placeholder</Label>
        <Input
          id="cfg-placeholder"
          value={config.placeholder}
          onChange={(e) => set('placeholder', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-min">Min length</Label>
          <Input
            id="cfg-min"
            type="number"
            value={config.minLength ?? ''}
            onChange={(e) => set('minLength', numOrUndef(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="cfg-max">Max length</Label>
          <Input
            id="cfg-max"
            type="number"
            value={config.maxLength ?? ''}
            onChange={(e) => set('maxLength', numOrUndef(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-prefix">Prefix</Label>
          <Input
            id="cfg-prefix"
            value={config.prefix}
            onChange={(e) => set('prefix', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div>
          <Label htmlFor="cfg-suffix">Suffix</Label>
          <Input
            id="cfg-suffix"
            value={config.suffix}
            onChange={(e) => set('suffix', e.target.value)}
            placeholder=".com"
          />
        </div>
      </div>
    </div>
  );
};
