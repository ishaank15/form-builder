import { z } from 'zod';

export const textareaConfigSchema = z.object({
  placeholder: z.string().default(''),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  rows: z.number().int().min(1).max(20).default(3),
});

export type TextareaConfig = z.infer<typeof textareaConfigSchema>;

export const textareaValueSchema = (cfg: TextareaConfig) => {
  let s: z.ZodType<string> = z.string();
  if (cfg.minLength !== undefined) s = (s as z.ZodString).min(cfg.minLength);
  if (cfg.maxLength !== undefined) s = (s as z.ZodString).max(cfg.maxLength);
  return s.optional();
};
