import { Input } from '@/shared/ui';
import type { RendererProps } from '../../types';
import type { NumberConfig } from './schema';

const parseNumber = (raw: string, decimals: number): number | undefined => {
  if (raw === '') return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  if (decimals === 0) return Math.trunc(n);
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: RendererProps<NumberConfig, number>) => {
  const hasAffix = config.prefix !== '' || config.suffix !== '';
  const step = config.decimals === 0 ? 1 : 1 / 10 ** config.decimals;

  const inputProps = {
    type: 'number' as const,
    inputMode: 'decimal' as const,
    value: value ?? '',
    step,
    min: config.min,
    max: config.max,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(parseNumber(e.target.value, config.decimals)),
    onBlur,
    disabled,
    readOnly,
  };

  if (!hasAffix) return <Input {...inputProps} invalid={Boolean(error)} />;

  return (
    <div className="flex items-stretch overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10">
      {config.prefix !== '' && (
        <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
          {config.prefix}
        </span>
      )}
      <Input {...inputProps} className="border-0 focus:ring-0" />
      {config.suffix !== '' && (
        <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
          {config.suffix}
        </span>
      )}
    </div>
  );
};
