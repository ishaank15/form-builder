import { Input, Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { DateConfig } from './schema';

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<DateConfig>) => {
  const set = <K extends keyof DateConfig>(key: K, v: DateConfig[K]) =>
    onChange({ ...config, [key]: v });

  const setOptionalIso = (key: 'minDate' | 'maxDate', raw: string) => {
    if (raw === '') {
      const next = { ...config };
      delete next[key];
      onChange(next);
    } else {
      onChange({ ...config, [key]: raw });
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={config.prefillToday}
          onChange={(e) => set('prefillToday', e.target.checked)}
          className="h-4 w-4 accent-slate-900"
        />
        Pre-fill with today&apos;s date
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cfg-date-min">Min date</Label>
          <Input
            id="cfg-date-min"
            type="date"
            value={config.minDate ?? ''}
            onChange={(e) => setOptionalIso('minDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cfg-date-max">Max date</Label>
          <Input
            id="cfg-date-max"
            type="date"
            value={config.maxDate ?? ''}
            onChange={(e) => setOptionalIso('maxDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
