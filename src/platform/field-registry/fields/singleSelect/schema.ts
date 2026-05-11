import { z } from 'zod';

export const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export type SelectOption = z.infer<typeof optionSchema>;

export type DisplayMode = 'radio' | 'dropdown' | 'tiles';

export const singleSelectConfigSchema = z.object({
  options: z.array(optionSchema).min(1),
  displayMode: z.enum(['radio', 'dropdown', 'tiles']).default('dropdown'),
});

export type SingleSelectConfig = z.infer<typeof singleSelectConfigSchema>;

export const singleSelectValueSchema = (cfg: SingleSelectConfig) => {
  if (cfg.options.length === 0) return z.string().optional();
  const allowed = cfg.options.map((o) => o.id) as [string, ...string[]];
  return z.enum(allowed).optional();
};
