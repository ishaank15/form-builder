import { definePlugin } from '../../types';
import { textareaConfigSchema, textareaValueSchema, type TextareaConfig } from './schema';
import { textareaDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const textareaPlugin = definePlugin<'textarea', TextareaConfig, string>({
  kind: 'textarea',
  label: 'Multi-line text',
  category: 'input',
  icon: '¶',
  pluginVersion: 1,
  configSchema: textareaConfigSchema,
  valueSchema: textareaValueSchema,
  defaults: textareaDefaults,
  isAggregable: false,
  capturesValue: true,
  operators: ['eq', 'neq', 'contains'],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value) => value ?? '',
});
