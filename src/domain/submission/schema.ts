import { z } from 'zod';
import { zSubmissionId, zTemplateId } from '@/domain/id';
import { FORM_SCHEMA_VERSION } from '@/domain/form/types';
import type { Submission } from './types';

export const submissionSchema = z.object({
  id: zSubmissionId,
  templateId: zTemplateId,
  templateVersion: z.number().int().nonnegative(),
  schemaVersion: z.literal(FORM_SCHEMA_VERSION),
  submittedAt: z.string(),
  values: z.record(z.string(), z.unknown()),
});

/** Boundary parser. */
export const parseSubmission = (raw: unknown): Submission =>
  submissionSchema.parse(raw) as Submission;
