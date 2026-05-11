import { definePlugin } from '../../types';
import { fileConfigSchema, fileValueSchema, type FileConfig, type FileMeta } from './schema';
import { fileDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

export const filePlugin = definePlugin<'file', FileConfig, FileMeta[]>({
  kind: 'file',
  label: 'File upload',
  category: 'input',
  icon: '↑',
  pluginVersion: 1,
  configSchema: fileConfigSchema,
  valueSchema: fileValueSchema,
  defaults: fileDefaults,
  isAggregable: false,
  capturesValue: true,
  /** No condition operators per spec (file isn't in the operator table). */
  operators: [],
  Renderer,
  ConfigPanel,
  formatForDisplay: (value) => {
    if (!Array.isArray(value) || value.length === 0) return '';
    if (value.length === 1) return value[0]!.name;
    return `${value.length} files: ${value.map((f) => f.name).join(', ')}`;
  },
});
