import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = ({ className, required, children, ...rest }: LabelProps) => (
  <label className={cn('block text-sm font-medium text-slate-700', className)} {...rest}>
    {children}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);
