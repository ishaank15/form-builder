import { Input, Label } from '@/shared/ui';
import type { ConfigPanelProps } from '../../types';
import type { FileConfig } from './schema';

export const ConfigPanel = ({ config, onChange }: ConfigPanelProps<FileConfig>) => (
  <div className="space-y-3">
    <div>
      <Label htmlFor="cfg-file-types">Allowed file types</Label>
      <Input
        id="cfg-file-types"
        value={config.allowedTypes}
        onChange={(e) => onChange({ ...config, allowedTypes: e.target.value })}
        placeholder=".pdf,.jpg,.png"
      />
      <p className="mt-1 text-xs text-slate-500">
        Comma-separated extensions. Leave blank to accept any file.
      </p>
    </div>
    <div>
      <Label htmlFor="cfg-file-max">Max number of files</Label>
      <Input
        id="cfg-file-max"
        type="number"
        min={1}
        max={50}
        value={config.maxFiles}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange({
            ...config,
            maxFiles: Number.isFinite(n) ? Math.max(1, Math.min(50, Math.trunc(n))) : 1,
          });
        }}
      />
    </div>
  </div>
);
