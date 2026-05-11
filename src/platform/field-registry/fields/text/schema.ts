import { z } from 'zod';

export const textConfigSchema = z.object({
  placeholder: z.string().default(''),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
});

export type TextConfig = z.infer<typeof textConfigSchema>;

export const textValueSchema = (cfg: TextConfig) => {
  let s: z.ZodType<string> = z.string();
  if (cfg.minLength !== undefined) s = (s as z.ZodString).min(cfg.minLength);
  if (cfg.maxLength !== undefined) s = (s as z.ZodString).max(cfg.maxLength);
  return s.optional();
};
