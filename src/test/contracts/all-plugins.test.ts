import { allPlugins } from '@/platform/field-registry';
import { buildPluginContract } from './pluginContract';

for (const plugin of allPlugins()) {
  buildPluginContract(plugin);
}
