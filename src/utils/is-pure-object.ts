export function isPureObject(input: any): input is object {
  return null !== input && typeof input === "object" && Object.getPrototypeOf(input).isPrototypeOf(Object);
}
