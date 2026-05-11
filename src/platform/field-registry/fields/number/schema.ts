import { z } from 'zod';

export const numberConfigSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  /** Decimals 0..4 per spec. */
  decimals: z.number().int().min(0).max(4).default(0),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
});

export type NumberConfig = z.infer<typeof numberConfigSchema>;

export const numberValueSchema = (cfg: NumberConfig) => {
  let s: z.ZodType<number> = z.number();
  if (cfg.min !== undefined) s = (s as z.ZodNumber).min(cfg.min);
  if (cfg.max !== undefined) s = (s as z.ZodNumber).max(cfg.max);
  return s.optional();
};
