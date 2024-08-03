export function isProxifiedData(data: any): data is object {
  if (data === Object.prototype) return false;

  return (typeof data === "object" && data !== null) || typeof data === "function";
}
