/** Conditions engine — public surface. */
export {
  registerOperator,
  getOperator,
  allOperators,
  isEmpty,
  type OperatorImpl,
  type ComparandKind,
} from './operators';

export { evaluateConditions, type ConditionsResult } from './evaluator';

export {
  buildConditionsGraph,
  transitiveDependents,
  type ConditionsGraph,
} from './graph';
