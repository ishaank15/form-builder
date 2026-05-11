/**
 * FieldShell — the consistent wrapper around every input field. Owns label, help text,
 * and error rendering, so plugin Renderers focus on the input itself.
 */
import type { ReactNode } from 'react';
import { Label } from '@/shared/ui';

interface Props {
  readonly label: string;
  readonly helpText?: string | undefined;
  readonly required?: boolean;
  readonly error?: string | undefined;
  readonly children: ReactNode;
}

export const FieldShell = ({ label, helpText, required, error, children }: Props) => (
  <div className="space-y-1.5" data-field>
    <Label required={required ?? false}>{label}</Label>
    {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    {children}
    {error && (
      <p className="text-xs text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
);
