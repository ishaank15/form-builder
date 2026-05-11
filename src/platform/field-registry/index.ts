/**
 * Public surface of the field registry.
 *
 * Consumers import `getPlugin`, `allPlugins`, the FieldKind union, and the FieldDefinition
 * narrowed type from here. Direct imports from `./fields/<name>` are forbidden by lint.
 */
export {
  PLUGINS,
  getPlugin,
  allPlugins,
  isFieldOfKind,
  isKnownKind,
  type FieldKind,
  type PluginFor,
  type ConfigFor,
  type ValueFor,
  type Field,
  type FieldDefinition,
} from './registry';

export {
  definePlugin,
  type FieldPlugin,
  type FieldCategory,
  type RendererProps,
  type ConfigPanelProps,
  type ConfigPanelFormContext,
} from './types';
