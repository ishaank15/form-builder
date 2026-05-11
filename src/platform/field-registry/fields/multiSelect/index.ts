import { definePlugin } from '../../types';
import {
  multiSelectConfigSchema,
  multiSelectValueSchema,
  type MultiSelectConfig,
} from './schema';
import { multiSelectDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const multiSelectPlugin = definePlugin<'multiSelect', MultiSelectConfig, string[]>({
  kind: 'multiSelect',
  label: 'Multi select',
  category: 'choice',
  icon: '☑',
  pluginVersion: 1,
  configSchema: multiSelectConfigSchema,
  valueSchema: multiSelectValueSchema,
  defaults: multiSelectDefaults,
  isAggregable: false,
  capturesValue: true,
  operators: ['containsAnyOf', 'containsAllOf', 'containsNoneOf'],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value, cfg) => {
    if (!Array.isArray(value) || value.length === 0) return '';
    const labels = value.map(
      (id) => cfg.options.find((o) => o.id === id)?.label ?? id,
    );
    return labels.join(', ');
  },
});
