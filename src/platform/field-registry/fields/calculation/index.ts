import { definePlugin } from '../../types';
import {
  calculationConfigSchema,
  calculationValueSchema,
  type CalculationPluginConfig,
} from './schema';
import { calculationDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const calculationPlugin = definePlugin<'calculation', CalculationPluginConfig, number>({
  kind: 'calculation',
  label: 'Calculation',
  category: 'computed',
  icon: '∑',
  pluginVersion: 1,
  configSchema: calculationConfigSchema,
  valueSchema: calculationValueSchema,
  defaults: calculationDefaults,
  /** Calc cannot source another calc — see spec. Plugin advertises non-aggregable. */
  isAggregable: false,
  capturesValue: false,
  /** Calc fields aren't valid condition targets — they're outputs, not inputs. */
  operators: [],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value, cfg) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(cfg.precision) : '',
});
