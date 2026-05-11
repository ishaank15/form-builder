import { definePlugin } from '../../types';
import { dateConfigSchema, dateValueSchema, todayIso, type DateConfig } from './schema';
import { dateDefaults } from './defaults';
import { Renderer } from './Renderer';
import { ConfigPanel } from './ConfigPanel';

const formatDateForDisplay = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const datePlugin = definePlugin<'date', DateConfig, string>({
  kind: 'date',
  label: 'Date',
  category: 'input',
  icon: '◷',
  pluginVersion: 1,
  configSchema: dateConfigSchema,
  valueSchema: dateValueSchema,
  defaults: dateDefaults,
  isAggregable: false,
  capturesValue: true,
  operators: ['eq', 'before', 'after'],
  initialValue: (cfg) => (cfg.prefillToday ? todayIso() : undefined),
  Renderer,
  ConfigPanel,
  formatForDisplay: (value) => (value ? formatDateForDisplay(value) : ''),
});
