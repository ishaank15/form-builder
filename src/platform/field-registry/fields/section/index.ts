import { definePlugin } from '../../types';
import { sectionConfigSchema, sectionValueSchema, type SectionConfig } from './schema';
import { sectionDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const sectionPlugin = definePlugin<'section', SectionConfig, undefined>({
  kind: 'section',
  label: 'Section header',
  category: 'layout',
  icon: '§',
  pluginVersion: 1,
  configSchema: sectionConfigSchema,
  valueSchema: sectionValueSchema,
  defaults: sectionDefaults,
  isAggregable: false,
  capturesValue: false,
  operators: [],
  Renderer,
  ConfigPanel,
  formatForDisplay: () => '',
});
