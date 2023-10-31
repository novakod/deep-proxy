import { isPureObject } from "./is-pure-object";

export function isProxifiedData(data: any): data is object {
  return Array.isArray(data) || isPureObject(data);
}
