import { z } from 'zod';

/**
 * File metadata only — spec is explicit: no upload to a server.
 *
 * We capture filename, size, type, lastModified at selection time. The actual file bytes
 * are NOT persisted. This keeps localStorage small and matches the spec note that "PDF
 * export should handle the fact that file contents cannot be embedded."
 */
export const fileMetaSchema = z.object({
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  type: z.string(), // MIME, may be ''
  lastModified: z.number().int().nonnegative(),
});

export type FileMeta = z.infer<typeof fileMetaSchema>;

export const fileConfigSchema = z.object({
  /** Comma-separated extensions like ".pdf,.jpg,.png". Empty means any. */
  allowedTypes: z.string().default(''),
  maxFiles: z.number().int().min(1).max(50).default(1),
});

export type FileConfig = z.infer<typeof fileConfigSchema>;

export const fileValueSchema = (cfg: FileConfig) =>
  z
    .array(fileMetaSchema)
    .superRefine((files, ctx) => {
      if (files.length > cfg.maxFiles) {
        ctx.addIssue({
          code: 'custom',
          message: `Up to ${cfg.maxFiles} file${cfg.maxFiles === 1 ? '' : 's'} allowed.`,
        });
      }
      if (cfg.allowedTypes.trim() !== '') {
        const allowed = cfg.allowedTypes
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.startsWith('.'));
        if (allowed.length > 0) {
          for (const f of files) {
            const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
            if (!allowed.includes(ext)) {
              ctx.addIssue({
                code: 'custom',
                message: `${f.name}: extension not allowed (${cfg.allowedTypes}).`,
              });
            }
          }
        }
      }
    })
    .optional();
