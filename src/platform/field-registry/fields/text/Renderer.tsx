import { Input } from '@/shared/ui';
import type { RendererProps } from '../../types';
import type { TextConfig } from './schema';

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: RendererProps<TextConfig, string>) => {
  const hasAffix = config.prefix !== '' || config.suffix !== '';
  const input = (
    <Input
      type="text"
      value={value ?? ''}
      placeholder={config.placeholder}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      readOnly={readOnly}
      invalid={Boolean(error)}
      maxLength={config.maxLength}
    />
  );

  if (!hasAffix) return input;

  return (
    <div className="flex items-stretch overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10">
      {config.prefix !== '' && (
        <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
          {config.prefix}
        </span>
      )}
      <Input
        type="text"
        value={value ?? ''}
        placeholder={config.placeholder}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={config.maxLength}
        className="border-0 focus:ring-0"
      />
      {config.suffix !== '' && (
        <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
          {config.suffix}
        </span>
      )}
    </div>
  );
};
