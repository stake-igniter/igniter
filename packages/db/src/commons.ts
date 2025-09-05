/**
 * Converts an enum-like object to a tuple of PostgreSQL-compatible enum values.
 *
 * @param myEnum - The enum-like object to convert. It should be an object where keys are strings and values are the corresponding enum values.
 * @return A tuple containing the enum values as strings, where the first value is mandatory, followed by zero or more values.
 */
export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
}
