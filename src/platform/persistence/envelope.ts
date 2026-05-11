/**
 * Versioned envelope wrapping every persisted value.
 *
 * Reads always go through `unwrapEnvelope`, which (a) parses the envelope, (b) runs the
 * migration chain from `payloadVersion` to the current target version, (c) returns the
 * payload. If parsing fails, returns null and surfaces a console warning — we never
 * throw into application code from this layer.
 */
import { z } from 'zod';

export interface Envelope<T = unknown> {
  readonly payloadVersion: number;
  readonly writtenAt: string;
  readonly payload: T;
}

export const envelopeSchema = z.object({
  payloadVersion: z.number().int().nonnegative(),
  writtenAt: z.string(),
  payload: z.unknown(),
});

export const wrapEnvelope = <T>(payload: T, payloadVersion: number): Envelope<T> => ({
  payloadVersion,
  writtenAt: new Date().toISOString(),
  payload,
});

export const unwrapEnvelope = <T>(raw: unknown): Envelope<T> | null => {
  const r = envelopeSchema.safeParse(raw);
  if (!r.success) {
    if (typeof console !== 'undefined') {
      console.warn('[persistence] failed to parse envelope', r.error.issues);
    }
    return null;
  }
  return r.data as Envelope<T>;
};
