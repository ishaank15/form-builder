/**
 * Zod schema for the FORM ENVELOPE — the parts of FormDefinition that the domain owns.
 *
 * Per-field `config` is intentionally `unknown` here; it is validated against the relevant
 * plugin's `configSchema` at the registry boundary. This separation lets the registry stay
 * open while keeping the form envelope's shape under domain control.
 *
 * Schemas are NOT annotated as `z.ZodType<DomainType>` — see condition/schema.ts for why.
 * `parseFormDefinition()` is the single boundary that produces a domain value.
 */
import { z } from 'zod';
import { zFieldId, zTemplateId } from '@/domain/id';
import { conditionSchema } from '@/domain/condition/schema';
import { FORM_SCHEMA_VERSION } from './types';
import type { FormDefinition } from './types';

const defaultVisibilitySchema = z.enum(['visible', 'hidden']);

export const fieldEnvelopeSchema = z.object({
  id: zFieldId,
  key: z.string().min(1),
  kind: z.string().min(1),
  label: z.string(),
  helpText: z.string().optional(),
  config: z.unknown(),
  defaultVisibility: defaultVisibilitySchema,
  defaultRequired: z.boolean(),
  conditions: z.array(conditionSchema),
});

export const formDefinitionSchema = z.object({
  schemaVersion: z.literal(FORM_SCHEMA_VERSION),
  id: zTemplateId,
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fields: z.array(fieldEnvelopeSchema),
});

/** The single, intentional boundary cast from raw JSON to the domain type. */
export const parseFormDefinition = (raw: unknown): FormDefinition =>
  formDefinitionSchema.parse(raw) as FormDefinition;
