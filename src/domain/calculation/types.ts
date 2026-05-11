/**
 * Calculation aggregator IDs.
 *
 * The calculation field is itself a regular field plugin whose *config* carries the shape
 * below. The aggregator registry holds the implementations. Adding MEDIAN later is one
 * register() call and one entry here — no other code in the codebase changes.
 */
import type { FieldId } from "@/domain/id";

export type AggregatorId = "SUM" | "AVG" | "MIN" | "MAX" | "MUL";

/**
 * The calculation field plugin's config. Lives in domain (not in the plugin folder) because
 * (a) the calculations engine consumes it without going through the plugin registry, and
 * (b) the form invariants enforce constraints on it (no calc-of-calc) at the domain layer.
 */
export interface CalculationFieldConfig {
  readonly sources: ReadonlyArray<FieldId>;
  readonly aggregator: AggregatorId;
  /** Decimals 0..4 per spec. */
  readonly precision: number;
}
