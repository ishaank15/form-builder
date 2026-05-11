/**
 * Form domain types.
 *
 * A FormDefinition is a serializable, versioned, declarative document. Fields are a flat
 * ordered list. Each field carries its own config (per-kind), its default visibility/required
 * state, and a list of conditions that override those defaults at fill-time.
 *
 * The FieldDefinition union is *not* hand-written here — it is computed in
 * `@/platform/field-registry/registry.ts` from the PLUGINS map, so adding a plugin
 * automatically extends the union. To break the circular dependency between domain and the
 * registry, we declare a structural FieldBase here that the registry parameterises.
 *
 * This file imports zero React. Lint enforces it.
 */
import type { FieldId, TemplateId } from '@/domain/id';
import type { Condition } from '@/domain/condition/types';

export const FORM_SCHEMA_VERSION = 1 as const;
export type FormSchemaVersion = typeof FORM_SCHEMA_VERSION;

/** Default visibility/required state for a field. Conditions modify these at runtime. */
export type DefaultVisibility = 'visible' | 'hidden';

/**
 * Structural shape every FieldDefinition must satisfy. The registry layer narrows
 * `kind` and `config` per plugin and emits the discriminated union.
 *
 * Properties carrying domain semantics (id, key, conditions, defaults) are owned here,
 * not by the registry, because they are common to all field types.
 */
export interface FieldBase<TKind extends string, TConfig> {
  readonly id: FieldId;
  /** Stable, unique-per-form identifier (snake_case). Used in PDF and exports. */
  readonly key: string;
  readonly kind: TKind;
  readonly label: string;
  readonly helpText?: string;
  readonly config: TConfig;

  /** Initial state when no condition is active. Conditions can override these. */
  readonly defaultVisibility: DefaultVisibility;
  readonly defaultRequired: boolean;

  /** Conditions whose effects apply to *this* field when their predicates are true. */
  readonly conditions: ReadonlyArray<Condition>;
}

/**
 * Forward-declared FieldDefinition. The concrete union is exported from the registry as
 * `FieldDefinition` (re-exported there). Domain code that needs to be field-kind-agnostic
 * uses this opaque alias; code that needs to narrow imports from the registry.
 */
export type AnyFieldDefinition = FieldBase<string, unknown>;

export interface FormDefinition {
  readonly schemaVersion: FormSchemaVersion;
  readonly id: TemplateId;
  readonly name: string;
  readonly description?: string;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fields: ReadonlyArray<AnyFieldDefinition>;
}
