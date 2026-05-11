import type { CalculationPluginConfig } from './schema';
export const calculationDefaults: { readonly config: CalculationPluginConfig } = {
  config: { sources: [], aggregator: 'SUM', precision: 2 },
};
