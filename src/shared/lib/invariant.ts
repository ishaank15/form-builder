export const invariant: (cond: unknown, msg?: string) => asserts cond = (
  cond,
  msg = 'Invariant violation',
) => {
  if (!cond) throw new Error(msg);
};
