/** Calculations engine — public surface. */
export {
  registerAggregator,
  getAggregator,
  allAggregators,
  round,
  type AggregatorImpl,
  type AggregatorOptions,
} from './aggregators';

export {
  buildCalculationsGraph,
  topoSortCalculations,
  type CalculationOrder,
  type CalculationOrderResult,
  type CalculationCycleError,
} from './graph';

export { evaluateCalculations, type CalculationsResult } from './evaluator';
