/**
 * Section renderer — a heading sized by config. capturesValue: false, so FieldRenderer
 * skips the FieldShell wrapper and renders this bare. The heading text is the field-level
 * label, passed via RendererProps.fieldLabel — that's why layout plugins receive it.
 */
import { cn } from '@/shared/lib/cn';
import type { RendererProps } from '../../types';
import type { SectionConfig } from './schema';

const sizeStyles: Record<SectionConfig['size'], string> = {
  XS: 'text-xs font-semibold uppercase tracking-wider text-slate-500',
  S: 'text-sm font-semibold text-slate-700',
  M: 'text-lg font-semibold text-slate-900',
  L: 'text-xl font-semibold text-slate-900',
  XL: 'text-2xl font-bold text-slate-900',
};

export const Renderer = ({ config, fieldLabel }: RendererProps<SectionConfig, undefined>) => (
  <div data-section className="pt-3">
    <p className={cn(sizeStyles[config.size])}>{fieldLabel || 'Section'}</p>
    <hr className="mt-2 border-slate-200" />
  </div>
);
