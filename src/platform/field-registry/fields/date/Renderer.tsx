import { Input } from '@/shared/ui';
import type { RendererProps } from '../../types';
import type { DateConfig } from './schema';

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: RendererProps<DateConfig, string>) => (
  <Input
    type="date"
    value={value ?? ''}
    min={config.minDate}
    max={config.maxDate}
    onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
    onBlur={onBlur}
    disabled={disabled}
    readOnly={readOnly}
    invalid={Boolean(error)}
  />
);
