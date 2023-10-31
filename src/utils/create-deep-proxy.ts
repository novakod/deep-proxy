import { DeepProxyHandler, Prettify } from "../types";
import { isProxifiedData } from "./is-proxified-data";

export function createDeepProxy<Target extends object>(rootTarget: Target, handler: Prettify<DeepProxyHandler<Target>>): Target {
  const proxiesMap = new Map();

  function proxify<Target extends object>(target: Target, path: (string | symbol)[] = []): Target {
    if (!isProxifiedData(target)) {
      return target;
    }

    if (proxiesMap.has(target)) {
      return proxiesMap.get(target);
    }

    const proxy = new Proxy(target, {
      get(target, key, reciever) {
        const newPath = [...path, key];
        const value = handler.get ? handler.get({ target, key, path: newPath, reciever, rootTarget }) : Reflect.get(target, key, reciever);

        return proxify(value, newPath);
      },
      set(target, key, value, reciever) {
        if (handler.set) {
          return handler.set({ target, key, value, path: [...path, key], reciever, rootTarget });
        }

        return Reflect.set(target, key, value, reciever);
      },
      deleteProperty(target, key) {
        if (handler.deleteProperty) {
          return handler.deleteProperty({ target, key, path: [...path, key], rootTarget });
        }

        return Reflect.deleteProperty(target, key);
      },
    });

    proxiesMap.set(target, proxy);

    return proxy;
  }

  return proxify(rootTarget);
}
