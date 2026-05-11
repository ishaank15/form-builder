import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition',
        'placeholder:text-slate-400',
        'focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10',
        'disabled:bg-slate-50 disabled:text-slate-500',
        invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-300',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
