declare type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type GetHandlerArgs<Target extends object> = {
  rootTarget: Target;
  target: Record<string | symbol, any>;
  nestedKeys: (string | symbol)[];
  key: string | symbol;
};

type SetHandlerArgs<Target extends object> = {
  rootTarget: Target;
  target: Record<string | symbol, any>;
  nestedKeys: (string | symbol)[];
  key: string | symbol;
  value: any;
};

type DeepProxyHandler<Target extends object> = {
  get?(args: GetHandlerArgs<Target>): any;
  set?(args: SetHandlerArgs<Target>): boolean;
};

export function createDeepProxy<Target extends object>(rootTarget: Target, handler: Prettify<DeepProxyHandler<Target>>) {
  function getTargetKeys<T extends object>(target: T): Exclude<keyof T, symbol | number>[] {
    return Object.keys(target) as Exclude<keyof T, symbol | number>[];
  }

  function isPureObject(input: any): input is object {
    return null !== input && typeof input === "object" && Object.getPrototypeOf(input).isPrototypeOf(Object);
  }

  function isProxifiedData(data: any): data is object {
    return Array.isArray(data) || isPureObject(data);
  }

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

    if (handler.get) proxyHandler.get = (target: T, key: string | symbol) => handler.get!({ rootTarget, target: target as any, nestedKeys: [...pathKeys, key], key });
    if (handler.set)
      proxyHandler.set = (target: T, key: string | symbol, value: any) => handler.set!({ rootTarget, target: target as any, nestedKeys: [...pathKeys, key], key, value });

    return new Proxy(target, proxyHandler);
  }

  return proxify(rootTarget);
}
