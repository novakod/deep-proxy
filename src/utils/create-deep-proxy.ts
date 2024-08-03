import { DeepProxyHandler } from "../types";
import { isProxifiedData } from "./is-proxified-data";
import { isPureObject } from "@novakod/is-pure-object";

const PROXY_SYMBOL = Symbol("proxy");
const HANDLER_TO_PROXY_SYMBOL = Symbol("handler_to_proxy_weakmap");

export function isDeepProxy(target: object) {
  return !!target?.[PROXY_SYMBOL as keyof object];
}

export function unproxify<Target extends object>(proxy: Target): Target {
  return proxy?.[PROXY_SYMBOL as keyof Target] as Target;
}

export function createDeepProxy<Target extends object>(rootTarget: Target, handler: DeepProxyHandler<Target>): Target {
  function proxify<Target extends object>(target: Target, path: (string | symbol)[] = []): Target {
    type HandleToProxyWeakMap = WeakMap<DeepProxyHandler<object>, object>;
    if (!isProxifiedData(target)) {
      return target;
    }

    if (isDeepProxy(target)) {
      return target;
    }

    const map = target[HANDLER_TO_PROXY_SYMBOL as keyof Target] as HandleToProxyWeakMap | undefined;
    if (map && map.has(handler)) {
      return map.get(handler) as Target;
    }

    const proxyHandler: ProxyHandler<Target> = {
      get(target, key, reciever) {
        if (key === PROXY_SYMBOL) {
          return target;
        }

        const newPath = [...path, key];
        let value = handler.get ? handler.get({ target, key, path: newPath, reciever, rootTarget }) : Reflect.get(target, key, reciever);

        if (typeof value === "function" && !Array.isArray(target) && !isPureObject(target)) {
          value = value.bind(target);
        }

        return proxify(value, newPath);
      },
      set(target, key, value, reciever) {
        if (handler.set) {
          return handler.set({ target, key, value: unproxify(value) ?? value, path: [...path, key], reciever, rootTarget });
        }

        return Reflect.set(target, key, value, reciever);
      },
      deleteProperty(target, key) {
        if (handler.deleteProperty) {
          return handler.deleteProperty({ target, key, path: [...path, key], rootTarget });
        }

        return Reflect.deleteProperty(target, key);
      },
    };

    if (handler.getOwnPropertyDescriptor)
      proxyHandler.getOwnPropertyDescriptor = (target, key) => handler.getOwnPropertyDescriptor!({ rootTarget, path: [...path, key], target, key });
    if (handler.ownKeys) proxyHandler.ownKeys = (target) => handler.ownKeys!({ rootTarget, path, target });
    if (handler.defineProperty) proxyHandler.defineProperty = (target, key, descriptor) => handler.defineProperty!({ rootTarget, path: [...path, key], target, key, descriptor });
    if (handler.preventExtensions) proxyHandler.preventExtensions = (target) => handler.preventExtensions!({ rootTarget, path, target });
    if (handler.has) proxyHandler.has = (target, key) => handler.has!({ rootTarget, path: [...path, key], target, key });
    if (handler.apply) proxyHandler.apply = (target, thisArg, args) => handler.apply!({ rootTarget, path, target, thisArg, args });
    if (handler.construct) proxyHandler.construct = (target, args, newTarget) => handler.construct!({ rootTarget, path, target, args, newTarget });

    const proxy = new Proxy(target, proxyHandler);

    if (!target[HANDLER_TO_PROXY_SYMBOL as keyof Target]) {
      Object.defineProperty(target, HANDLER_TO_PROXY_SYMBOL as keyof Target, {
        value: new WeakMap(),
        writable: false,
        enumerable: false,
        configurable: false,
      });
    }

    (target[HANDLER_TO_PROXY_SYMBOL as keyof Target] as HandleToProxyWeakMap).set(handler, proxy);

    return proxy;
  }

  return proxify(rootTarget);
}
