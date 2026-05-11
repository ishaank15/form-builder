import { definePlugin } from '../../types';
import { textConfigSchema, textValueSchema, type TextConfig } from './schema';
import { textDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const textPlugin = definePlugin<'text', TextConfig, string>({
  kind: 'text',
  label: 'Single-line text',
  category: 'input',
  icon: 'T',
  pluginVersion: 1,
  configSchema: textConfigSchema,
  valueSchema: textValueSchema,
  defaults: textDefaults,
  isAggregable: false,
  capturesValue: true,
  operators: ['eq', 'neq', 'contains'],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value, cfg) => {
    if (value === undefined || value === '') return '';
    return `${cfg.prefix}${value}${cfg.suffix}`;
  },
});
