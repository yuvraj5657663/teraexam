/**
 * The generated Zod schemas coerce OpenAPI `format: date` fields into JS
 * `Date` objects (via `zod.coerce.date()`), but Drizzle's `date(..., { mode:
 * "string" })` columns expect a plain `YYYY-MM-DD` string. Convert any Date
 * values in a parsed body back to date-only strings before writing to the DB.
 */
export function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toDateOnlyStringMaybe(value: Date | null | undefined): string | null | undefined {
  if (value === null || value === undefined) return value;
  return toDateOnlyString(value);
}

/**
 * Replaces one or more `Date` (or `Date | null | undefined`) fields on an
 * object with date-only strings, returning a type where those keys are
 * typed as strings so the result is directly assignable to a Drizzle
 * `date(..., { mode: "string" })` insert/update shape.
 */
export function withDateStrings<T extends Record<string, unknown>, K extends keyof T>(
  data: T,
  keys: K[],
): Omit<T, K> & { [P in K]: string | (null extends T[P] ? null : never) | (undefined extends T[P] ? undefined : never) } {
  const result: Record<string, unknown> = { ...data };
  for (const key of keys) {
    result[key as string] = toDateOnlyStringMaybe(data[key] as Date | null | undefined);
  }
  return result as Omit<T, K> & {
    [P in K]: string | (null extends T[P] ? null : never) | (undefined extends T[P] ? undefined : never);
  };
}
