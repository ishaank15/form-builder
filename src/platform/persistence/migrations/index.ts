/**
 * Migration chain.
 *
 * `migrations[from]` produces the payload-shape at version `from + 1`. Reading a v0 payload
 * runs `migrations[0]`, then `migrations[1]`, etc., until the current target version.
 *
 * v0 → v1 is intentionally a no-op: this is the first version, but the chain is set up so
 * that future migrations land in one place. ADR explains the discipline.
 */
export type MigrationFn = (oldPayload: unknown) => unknown;

export const migrations: ReadonlyArray<MigrationFn> = [
  // v0 → v1: identity (we are at v1 today)
  (p) => p,
];

export const migratePayload = (
  payload: unknown,
  fromVersion: number,
  toVersion: number,
): unknown => {
  let cur = payload;
  for (let v = fromVersion; v < toVersion; v += 1) {
    const fn = migrations[v];
    if (!fn) {
      throw new Error(`No migration registered from v${v} → v${v + 1}`);
    }
    cur = fn(cur);
  }
  return cur;
};
