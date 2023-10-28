export function isPureObject(input: any) {
  return null !== input && typeof input === "object" && Object.getPrototypeOf(input).isPrototypeOf(Object);
}
