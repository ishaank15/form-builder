import { useRef } from 'react';
import { Button } from '@/shared/ui';
import type { RendererProps } from '../../types';
import type { FileConfig, FileMeta } from './schema';

const KB = 1024;
const formatSize = (bytes: number): string => {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < KB * KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / (KB * KB)).toFixed(1)} MB`;
};

const toMeta = (f: File): FileMeta => ({
  name: f.name,
  size: f.size,
  type: f.type,
  lastModified: f.lastModified,
});

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  disabled,
  readOnly,
}: RendererProps<FileConfig, FileMeta[]>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const files = Array.isArray(value) ? value : [];

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = [...e.target.files].map(toMeta);
    const merged = [...files, ...incoming].slice(0, config.maxFiles);
    onChange(merged.length === 0 ? undefined : merged);
    // reset native input so the same file can be re-selected later
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (i: number) => {
    const next = files.filter((_, idx) => idx !== i);
    onChange(next.length === 0 ? undefined : next);
  };

  return (
    <div className="space-y-2" onBlur={onBlur}>
      <input
        ref={inputRef}
        type="file"
        multiple={config.maxFiles > 1}
        accept={config.allowedTypes || undefined}
        disabled={disabled || readOnly}
        onChange={handleSelect}
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
      />
      {files.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-500">
                  {formatSize(f.size)} · {f.type || 'unknown type'}
                </p>
              </div>
              {!readOnly && !disabled && (
                <Button variant="ghost" onClick={() => remove(i)} aria-label="Remove file">
                  ×
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-500">
        File metadata is captured locally — contents are not uploaded or saved.
      </p>
    </div>
  );
};
