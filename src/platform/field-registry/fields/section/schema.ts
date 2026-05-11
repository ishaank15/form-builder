import { z } from 'zod';

export const sectionConfigSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']).default('M'),
});

export type SectionConfig = z.infer<typeof sectionConfigSchema>;

/** Section captures no value, but the contract requires a schema. Always undefined. */
export const sectionValueSchema = () => z.undefined().optional();
