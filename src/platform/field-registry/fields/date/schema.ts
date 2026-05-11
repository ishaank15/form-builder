import { z } from 'zod';

/** ISO date string yyyy-mm-dd (matches HTML <input type="date">). */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected yyyy-mm-dd');

export const dateConfigSchema = z.object({
  prefillToday: z.boolean().default(false),
  minDate: isoDate.optional(),
  maxDate: isoDate.optional(),
});

export type DateConfig = z.infer<typeof dateConfigSchema>;

export const dateValueSchema = (cfg: DateConfig) => {
  const s = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
    .superRefine((v, ctx) => {
      if (cfg.minDate !== undefined && v < cfg.minDate) {
        ctx.addIssue({ code: 'custom', message: `Earliest date is ${cfg.minDate}` });
      }
      if (cfg.maxDate !== undefined && v > cfg.maxDate) {
        ctx.addIssue({ code: 'custom', message: `Latest date is ${cfg.maxDate}` });
      }
    });
  return s.optional();
};

export const todayIso = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
