import { definePlugin } from '../../types';
import { numberConfigSchema, numberValueSchema, type NumberConfig } from './schema';
import { numberDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

const formatNumber = (value: number, cfg: NumberConfig): string => {
  const fixed = value.toFixed(cfg.decimals);
  return `${cfg.prefix}${fixed}${cfg.suffix}`.trim();
};

export const numberPlugin = definePlugin<'number', NumberConfig, number>({
  kind: 'number',
  label: 'Number',
  category: 'input',
  icon: '#',
  pluginVersion: 1,
  configSchema: numberConfigSchema,
  valueSchema: numberValueSchema,
  defaults: numberDefaults,
  isAggregable: true,
  capturesValue: true,
  operators: ['eq', 'gt', 'lt', 'between'],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value, cfg) => (value === undefined ? '' : formatNumber(value, cfg)),
});
