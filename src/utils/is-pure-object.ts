export function isPureObject(input: any): input is Record<string, any> {
  return null !== input && typeof input === "object" && Object.getPrototypeOf(input).isPrototypeOf(Object);
}
