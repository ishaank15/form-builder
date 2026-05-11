import { z } from 'zod';
import { aggregatorIdSchema } from '@/domain/calculation/schema';
import { zFieldId } from '@/domain/id';

export const calculationConfigSchema = z.object({
  sources: z.array(zFieldId).default([]),
  aggregator: aggregatorIdSchema.default('SUM'),
  precision: z.number().int().min(0).max(4).default(2),
});

export type CalculationPluginConfig = z.infer<typeof calculationConfigSchema>;

/**
 * The value of a calculation field is computed by the engine and written into the
 * form state. The schema accepts the engine's output (number) but tolerates undefined
 * during the brief window before the engine has run.
 */
export const calculationValueSchema = () => z.number().optional();
