import { DeepProxyHandler, Prettify } from "../types";
import { getTargetKeys } from "./get-target-keys";
import { isProxifiedData } from "./is-proxified-data";
import { isPureObject } from "./is-pure-object";

export function createDeepProxy<Target extends object>(rootTarget: Target, handler: Prettify<DeepProxyHandler<Target>>) {
  const proxiesMap = new WeakMap();

  function proxify<T extends object>(target: T, pathKeys: string[] = []): T {
    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        if (isProxifiedData(target[i])) {
          target[i] = proxify(target[i], [...pathKeys, i.toString()]);
        }
      }
    }
    if (isPureObject(target)) {
      for (const key of getTargetKeys(target)) {
        if (isProxifiedData(target[key])) {
          target[key] = proxify(target[key] as object, [...pathKeys, key]) as any;
        }
      }
    }

    const proxyHandler: ProxyHandler<T> = {};

    if (handler.getOwnPropertyDescriptor)
      proxyHandler.getOwnPropertyDescriptor = (target, key) => handler.getOwnPropertyDescriptor!({ rootTarget, nestedKeys: [...pathKeys, key], target, key });
    if (handler.ownKeys) proxyHandler.ownKeys = (target) => handler.ownKeys!({ rootTarget, nestedKeys: pathKeys, target });
    if (handler.defineProperty)
      proxyHandler.defineProperty = (target, key, descriptor) => handler.defineProperty!({ rootTarget, nestedKeys: [...pathKeys, key], target, key, descriptor });
    if (handler.deleteProperty) proxyHandler.deleteProperty = (target, key) => handler.deleteProperty!({ rootTarget, nestedKeys: [...pathKeys, key], target, key });
    if (handler.preventExtensions) proxyHandler.preventExtensions = (target) => handler.preventExtensions!({ rootTarget, nestedKeys: pathKeys, target });
    if (handler.has) proxyHandler.has = (target, key) => handler.has!({ rootTarget, nestedKeys: [...pathKeys, key], target, key });
    if (handler.get) proxyHandler.get = (target, key, reciever) => handler.get!({ rootTarget, nestedKeys: [...pathKeys, key], target, key, reciever });
    if (handler.set) proxyHandler.set = (target, key, value, reciever) => handler.set!({ rootTarget, nestedKeys: [...pathKeys, key], target: target as any, key, value, reciever });
    if (handler.apply) proxyHandler.apply = (target, thisArg, args) => handler.apply!({ rootTarget, nestedKeys: pathKeys, target, thisArg, args });
    if (handler.construct) proxyHandler.construct = (target, args, newTarget) => handler.construct!({ rootTarget, nestedKeys: pathKeys, target, args, newTarget });

    const proxy = new Proxy(target, proxyHandler);
    proxiesMap.set(proxy, target);
    return proxy;
  }

  return proxify(rootTarget);
}
