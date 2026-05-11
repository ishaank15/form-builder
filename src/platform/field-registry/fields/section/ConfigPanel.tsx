import { cn } from '@/shared/lib/cn';
import { Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { SectionConfig } from './schema';

const SIZES: SectionConfig['size'][] = ['XS', 'S', 'M', 'L', 'XL'];

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<SectionConfig>) => (
  <div className="space-y-3">
    <div>
      <Label>Heading size</Label>
      <div className="mt-1 inline-flex rounded-md border border-slate-200 p-0.5">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...config, size: s })}
            className={cn(
              'rounded px-3 py-1 text-xs font-medium',
              config.size === s
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  </div>
);
