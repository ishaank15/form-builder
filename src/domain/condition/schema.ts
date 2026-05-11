import { z } from 'zod';
import { zConditionId, zFieldId } from '@/domain/id';

/**
 * Schemas intentionally are NOT annotated `z.ZodType<DomainType>`. With branded types and
 * `exactOptionalPropertyTypes`, ZodType's input/output covariance produces false positives.
 * Instead we let Zod infer, and rely on `parseFormDefinition()` and `parseSubmission()` to
 * be the only paths from `unknown` to a domain value — those helpers cast at the boundary.
 */
export const conditionEffectSchema = z.enum([
  'show',
  'hide',
  'markRequired',
  'markNotRequired',
]);

export const operatorIdSchema = z.enum([
  'eq',
  'neq',
  'contains',
  'gt',
  'lt',
  'between',
  'containsAnyOf',
  'containsAllOf',
  'containsNoneOf',
  'before',
  'after',
]);

export const conditionSchema = z.object({
  id: zConditionId,
  targetFieldId: zFieldId,
  operator: operatorIdSchema,
  value: z.unknown(),
  effect: conditionEffectSchema,
});
