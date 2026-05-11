import { z } from 'zod';

export const multiSelectOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export type MultiSelectOption = z.infer<typeof multiSelectOptionSchema>;

export const multiSelectConfigSchema = z.object({
  options: z.array(multiSelectOptionSchema).min(1),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
});

export type MultiSelectConfig = z.infer<typeof multiSelectConfigSchema>;

export const multiSelectValueSchema = (cfg: MultiSelectConfig) => {
  const ids = new Set(cfg.options.map((o) => o.id));
  return z
    .array(z.string())
    .superRefine((vs, ctx) => {
      for (const v of vs) {
        if (!ids.has(v)) {
          ctx.addIssue({ code: 'custom', message: `Unknown option: ${v}` });
        }
      }
      if (cfg.minSelections !== undefined && vs.length < cfg.minSelections) {
        ctx.addIssue({
          code: 'custom',
          message: `Pick at least ${cfg.minSelections} option${cfg.minSelections === 1 ? '' : 's'}.`,
        });
      }
      if (cfg.maxSelections !== undefined && vs.length > cfg.maxSelections) {
        ctx.addIssue({
          code: 'custom',
          message: `Pick at most ${cfg.maxSelections} option${cfg.maxSelections === 1 ? '' : 's'}.`,
        });
      }
    })
    .optional();
};
