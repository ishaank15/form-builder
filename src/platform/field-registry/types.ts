/**
 * FieldPlugin contract.
 *
 * A plugin is a closed object that fully describes a field type. The registry composes
 * plugins into the discriminated union `FieldDefinition`. Adding a plugin is a one-folder
 * + one-line change; no other file in the codebase needs to know.
 *
 * See docs/FIELD_PLUGIN.md for the worked "add an 11th field type" example.
 */
import type { z } from 'zod';
import type { ComponentType, ReactNode } from 'react';
import type { FieldId } from '@/domain/id';
import type { OperatorId } from '@/domain/condition/types';
import type { AnyFieldDefinition } from '@/domain/form/types';

/** Props passed into a runtime field renderer (filler). */
export interface RendererProps<TConfig, TValue> {
  fieldId: FieldId;
  /** Field-level label. Most plugins ignore (FieldShell handles it); layout plugins use it. */
  fieldLabel: string;
  fieldHelpText?: string | undefined;
  config: TConfig;
  value: TValue | undefined;
  onChange: (next: TValue | undefined) => void;
  onBlur: () => void;
  error?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
}

/**
 * Optional form context handed to ConfigPanels whose config references other fields
 * (e.g. the calculation plugin's source picker). Plugins that don't need it ignore it.
 */
export interface ConfigPanelFormContext {
  readonly fields: ReadonlyArray<AnyFieldDefinition>;
  readonly selfId: FieldId;
}

/** Props passed into a config panel (builder). */
export interface ConfigPanelProps<TConfig> {
  config: TConfig;
  onChange: (next: TConfig) => void;
  form?: ConfigPanelFormContext;
}

export type FieldCategory = 'input' | 'choice' | 'layout' | 'computed';

export interface FieldPlugin<TKind extends string, TConfig, TValue> {
  /* Identity */
  readonly kind: TKind;
  readonly label: string;
  readonly category: FieldCategory;
  /** Single-character emoji or short symbol used in the palette/icon slot. */
  readonly icon: ReactNode;

  /* Versioning */
  readonly pluginVersion: number;
  readonly migrateConfig?: (oldConfig: unknown, fromVersion: number) => TConfig;

  /**
   * Schemas — single source of truth for both runtime and inferred types.
   *
   * Note: input type is `unknown` rather than `TConfig`/`TValue` because Zod's `.default()`
   * and `.transform()` produce schemas where input != output. The strict three-arg form
   * lets plugins use defaults without falling back to a looser `ZodTypeAny`.
   */
  readonly configSchema: z.ZodType<TConfig, z.ZodTypeDef, unknown>;
  readonly valueSchema: (
    config: TConfig,
  ) => z.ZodType<TValue | undefined, z.ZodTypeDef, unknown>;

  /* Defaults applied when dropped from the palette. */
  readonly defaults: { readonly config: TConfig };

  /* Behaviour advertisements consumed by other layers. */
  readonly isAggregable: boolean;
  /** Operator IDs this field type advertises in the conditions editor. */
  readonly operators: ReadonlyArray<OperatorId>;
  /** Whether the field captures user input at all (false for section, calculation). */
  readonly capturesValue: boolean;

  /**
   * Compute the initial value when starting a new submission. Used e.g. for
   * Date.prefillToday. Default: `undefined`.
   */
  readonly initialValue?: (config: TConfig) => TValue | undefined;

  /* UI surfaces */
  readonly Renderer: ComponentType<RendererProps<TConfig, TValue>>;
  readonly ConfigPanel: ComponentType<ConfigPanelProps<TConfig>>;
  readonly PrintRenderer?: ComponentType<RendererProps<TConfig, TValue>>;

  /* Optional value <-> JSON adapters (e.g. File metadata). */
  readonly serialize?: (value: TValue) => unknown;
  readonly deserialize?: (json: unknown) => TValue;

  /**
   * Format a value for read-only display: PDF, submission list, etc.
   * Plugins decide how their value renders as text.
   */
  readonly formatForDisplay: (value: TValue | undefined, config: TConfig) => string;
}

/** Helper to author a plugin while preserving generic inference. */
export const definePlugin = <TKind extends string, TConfig, TValue>(
  p: FieldPlugin<TKind, TConfig, TValue>,
): FieldPlugin<TKind, TConfig, TValue> => p;

/** Type-level helper used by the registry to infer config/value types from a schema. */
export type InferConfig<S> = S extends z.ZodType<infer T> ? T : never;
export type InferValueSchema<F> = F extends (cfg: never) => z.ZodType<infer V> ? V : never;
