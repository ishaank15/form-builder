import { definePlugin } from '../../types';
import {
  singleSelectConfigSchema,
  singleSelectValueSchema,
  type SingleSelectConfig,
} from './schema';
import { singleSelectDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const singleSelectPlugin = definePlugin<'singleSelect', SingleSelectConfig, string>({
  kind: 'singleSelect',
  label: 'Single select',
  category: 'choice',
  icon: '◉',
  pluginVersion: 1,
  configSchema: singleSelectConfigSchema,
  valueSchema: singleSelectValueSchema,
  defaults: singleSelectDefaults,
  isAggregable: false,
  capturesValue: true,
  operators: ['eq', 'neq'],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value, cfg) => {
    if (value === undefined) return '';
    return cfg.options.find((o) => o.id === value)?.label ?? value;
  },
});
