/**
 * FormRenderer — the live, interactive form. Reads the form definition, drives the
 * engines via useFormState, renders only visible fields in form order, surfaces errors
 * for touched-or-submitted fields.
 *
 * Same component is reused by Builder Mode's Preview pane (in M5) and the Filler route.
 * The `mode` prop disables submission in preview.
 */
import { useEffect } from 'react';
import type { FormDefinition } from '@/domain/form/types';
import { useFillerStore } from '../store/fillerStore';
import { useFormState } from '../hooks/useFormState';
import { FieldRenderer } from './FieldRenderer';
import { getPlugin, isKnownKind } from '@/platform/field-registry';

interface Props {
  readonly form: FormDefinition;
  readonly mode?: 'fill' | 'preview';
  /** Show errors before fields are touched. Used after a failed submit. */
  readonly showAllErrors?: boolean;
}

/** Compute initial values for a new fill, based on each plugin's optional initialValue. */
const computeInitialValues = (
  form: FormDefinition,
): Readonly<Record<string, unknown>> => {
  const out: Record<string, unknown> = {};
  for (const f of form.fields) {
    if (!isKnownKind(f.kind)) continue;
    const plugin = getPlugin(f.kind);
    if (!plugin.initialValue) continue;
    const initial = plugin.initialValue(f.config as never);
    if (initial !== undefined) out[f.id] = initial;
  }
  return out;
};

export const FormRenderer = ({ form, mode = 'fill', showAllErrors = false }: Props) => {
  const setMany = useFillerStore((s) => s.setMany);
  const { values, touched, visibility, required, errors } = useFormState(form);

  // On first mount (or template change), seed initial values from plugins.
  useEffect(() => {
    setMany(computeInitialValues(form));
  }, [form, setMany]);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} data-mode={mode}>
      {form.fields.map((field) => {
        const isVisible = visibility.get(field.id) ?? true;
        if (!isVisible) return null;
        const isRequired = required.get(field.id) ?? field.defaultRequired;
        const showErr = showAllErrors || touched[field.id] === true;
        const error = showErr ? errors.get(field.id) : undefined;
        return (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            required={isRequired}
            error={error}
          />
        );
      })}
    </form>
  );
};
