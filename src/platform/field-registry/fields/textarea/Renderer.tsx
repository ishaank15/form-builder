import { Textarea } from '@/shared/ui';
import type { RendererProps } from '../../types';
import type { TextareaConfig } from './schema';

export const Renderer = ({
  config,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: RendererProps<TextareaConfig, string>) => (
  <Textarea
    value={value ?? ''}
    rows={config.rows}
    placeholder={config.placeholder}
    maxLength={config.maxLength}
    onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
    onBlur={onBlur}
    disabled={disabled}
    readOnly={readOnly}
    invalid={Boolean(error)}
  />
);
