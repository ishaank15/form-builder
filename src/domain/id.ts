/**
 * Branded ID types — opaque strings that cannot be assigned to one another at compile time.
 *
 * Why: `function deleteSubmission(id: string)` accepts a FieldId by mistake. With brands,
 * that becomes a compile error. The runtime cost is zero — brands are erased.
 */
import { nanoid } from "nanoid";
import { z } from "zod";

declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type FieldId = Brand<string, "FieldId">;
export type TemplateId = Brand<string, "TemplateId">;
export type SubmissionId = Brand<string, "SubmissionId">;
export type ConditionId = Brand<string, "ConditionId">;
export type OptionId = Brand<string, "OptionId">;

const make =
  <B extends string>() =>
  (raw?: string): Brand<string, B> =>
    (raw ?? nanoid(12)) as Brand<string, B>;

export const FieldId = make<"FieldId">();
export const TemplateId = make<"TemplateId">();
export const SubmissionId = make<"SubmissionId">();
export const ConditionId = make<"ConditionId">();
export const OptionId = make<"OptionId">();

export const zFieldId = z
  .string()
  .min(1)
  .transform((s) => s as FieldId);
export const zTemplateId = z
  .string()
  .min(1)
  .transform((s) => s as TemplateId);
export const zSubmissionId = z
  .string()
  .min(1)
  .transform((s) => s as SubmissionId);
export const zConditionId = z
  .string()
  .min(1)
  .transform((s) => s as ConditionId);
export const zOptionId = z
  .string()
  .min(1)
  .transform((s) => s as OptionId);
