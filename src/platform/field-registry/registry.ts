/**
 * Static plugin registry.
 *
 * The PLUGINS object is the single source of truth for which field kinds exist.
 * `FieldKind` is derived as `keyof typeof PLUGINS`, so adding a plugin extends the union
 * automatically — exhaustive switches across the codebase will fail to compile until the
 * new kind is handled, and generic `getPlugin(field.kind)` callers keep working.
 */
import type { z } from 'zod';
import type { FieldPlugin } from './types';
import type { FieldBase } from '@/domain/form/types';

import { textPlugin } from './fields/text';
import { textareaPlugin } from './fields/textarea';
import { numberPlugin } from './fields/number';
import { datePlugin } from './fields/date';
import { singleSelectPlugin } from './fields/singleSelect';
import { multiSelectPlugin } from './fields/multiSelect';
import { filePlugin } from './fields/file';
import { sectionPlugin } from './fields/section';
import { calculationPlugin } from './fields/calculation';

export const PLUGINS = {
  text: textPlugin,
  textarea: textareaPlugin,
  number: numberPlugin,
  date: datePlugin,
  singleSelect: singleSelectPlugin,
  multiSelect: multiSelectPlugin,
  file: filePlugin,
  section: sectionPlugin,
  calculation: calculationPlugin,
} as const;

export type FieldKind = keyof typeof PLUGINS;

/** Plugin lookup type-narrowed by kind. */
export type PluginFor<K extends FieldKind> = (typeof PLUGINS)[K];

/** Per-kind config type, inferred from the plugin's configSchema. */
export type ConfigFor<K extends FieldKind> = z.infer<PluginFor<K>['configSchema']>;

/**
 * Per-kind value type. The plugin's valueSchema is a function of config returning a
 * Zod schema; we infer the schema's TS type. The schema produces `T | undefined`, so
 * `ValueFor<K>` is the non-undefined value type.
 */
export type ValueFor<K extends FieldKind> = NonNullable<
  z.infer<ReturnType<PluginFor<K>['valueSchema']>>
>;

/** A field of a specific kind, with its config narrowed and value type derived. */
export type Field<K extends FieldKind = FieldKind> = K extends FieldKind
  ? FieldBase<K, ConfigFor<K>>
  : never;

/** Discriminated union over all registered plugins. */
export type FieldDefinition = Field;

/** Type-safe lookup. */
export const getPlugin = <K extends FieldKind>(kind: K): PluginFor<K> => PLUGINS[kind];

/** Iterable view used by the palette and contract tests. */
type AnyPlugin = FieldPlugin<string, unknown, unknown>;
export const allPlugins = (): ReadonlyArray<AnyPlugin> =>
  Object.values(PLUGINS) as ReadonlyArray<AnyPlugin>;

/** Runtime check + type narrowing helper. */
export const isFieldOfKind = <K extends FieldKind>(
  field: { kind: string },
  kind: K,
): field is Field<K> => field.kind === kind;

/** Whether a string identifies a registered plugin. */
export const isKnownKind = (k: string): k is FieldKind => k in PLUGINS;
