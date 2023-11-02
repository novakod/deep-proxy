export function isProxifiedData(data: any): data is object {
  return typeof data === "object" && data !== null;
}
