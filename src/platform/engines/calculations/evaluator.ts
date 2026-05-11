/**
 * Calculations evaluator — pure.
 *
 * For each calculation field (in topological order), reads its source values from
 * `state.values`, filters out values from hidden source fields, and writes the
 * aggregator's result. The result is a Map<FieldId, number> that the caller merges
 * back into form state.
 *
 * Hidden source policy: hidden source fields are excluded from the aggregation. This
 * matches the spec's treatment of hidden fields ("must not appear in submitted data
 * or in the PDF export") and keeps calc results coherent with what the user sees.
 */
import type { FormDefinition } from '@/domain/form/types';
import type { FieldId } from '@/domain/id';
import type { CalculationFieldConfig } from '@/domain/calculation/types';
import { getAggregator } from './aggregators';
import { topoSortCalculations } from './graph';

export interface CalculationsResult {
  readonly values: ReadonlyMap<FieldId, number>;
  /** Field ids of any calc fields that couldn't be evaluated (e.g. due to a cycle). */
  readonly stuck: ReadonlyArray<FieldId>;
}

const isCalcConfig = (cfg: unknown): cfg is CalculationFieldConfig =>
  typeof cfg === 'object' &&
  cfg !== null &&
  'sources' in cfg &&
  'aggregator' in cfg &&
  Array.isArray((cfg as { sources: unknown }).sources);

export const evaluateCalculations = (
  form: FormDefinition,
  values: Readonly<Record<string, unknown>>,
  visibility: ReadonlyMap<FieldId, boolean>,
): CalculationsResult => {
  const sortResult = topoSortCalculations(form);
  const out = new Map<FieldId, number>();
  if (!sortResult.ok) {
    return { values: out, stuck: sortResult.error.cycle };
  }

  const fieldsById = new Map(form.fields.map((f) => [f.id, f]));
  // Working values: incorporate previously-computed calc results so calcs can chain
  // correctly when (defensive) calc-of-calc slips past invariants.
  const working: Record<string, unknown> = { ...values };

  for (const calcId of sortResult.value.order) {
    const field = fieldsById.get(calcId);
    if (!field || !isCalcConfig(field.config)) continue;
    const cfg = field.config;
    const sourceValues: unknown[] = [];
    for (const srcId of cfg.sources) {
      // Skip hidden source fields by policy.
      if (visibility.get(srcId) === false) continue;
      sourceValues.push(working[srcId]);
    }
    const agg = getAggregator(cfg.aggregator);
    const result = agg.compute(sourceValues, { precision: cfg.precision });
    out.set(calcId, result);
    working[calcId] = result;
  }

  return { values: out, stuck: [] };
};
