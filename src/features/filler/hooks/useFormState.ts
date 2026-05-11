/**
 * useFormState — the React adapter that composes the three engines into one render-time
 * snapshot of "what does the form look like right now?".
 *
 * Pure engines + thin React binding = trivially testable engines and a one-render-cycle
 * derivation that cannot be stale.
 *
 * The returned `effectiveValues` includes calculation results so the FieldRenderer can
 * read calc field values uniformly via the same map (no special case for read-only fields).
 */
import { useMemo } from 'react';
import type { FormDefinition } from '@/domain/form/types';
import { evaluateConditions } from '@/platform/engines/conditions';
import { evaluateCalculations } from '@/platform/engines/calculations';
import { validateValues } from '@/platform/engines/validation';
import { useFillerStore } from '../store/fillerStore';

export const useFormState = (form: FormDefinition) => {
  const values = useFillerStore((s) => s.values);
  const touched = useFillerStore((s) => s.touched);

  const conditions = useMemo(() => evaluateConditions(form, values), [form, values]);

  const calcs = useMemo(
    () => evaluateCalculations(form, values, conditions.visibility),
    [form, values, conditions.visibility],
  );

  const effectiveValues = useMemo(() => {
    if (calcs.values.size === 0) return values;
    const next: Record<string, unknown> = { ...values };
    for (const [id, v] of calcs.values) next[id] = v;
    return next;
  }, [values, calcs.values]);

  const validation = useMemo(
    () => validateValues(form, effectiveValues, conditions),
    [form, effectiveValues, conditions],
  );

  return {
    values: effectiveValues,
    touched,
    visibility: conditions.visibility,
    required: conditions.required,
    computed: calcs.values,
    stuckCalcs: calcs.stuck,
    errors: validation.errors,
    isValid: validation.ok,
  };
};
