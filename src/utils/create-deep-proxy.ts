declare type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type GetOwnPropertyDescriptorHanderArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
};

type OwnKeysHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
};

type DefinePropertyHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
  descriptor: PropertyDescriptor;
};

type DeletePropertyHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
};

type PreventExtensionsHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
};

type HasHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
};

type GetHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
  reciever: any;
};

type SetHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
  value: any;
  reciever: any;
};

type ApplyHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  thisArg: any;
  args: any[];
};

type ConstructHandlerArgs<Target extends object> = {
  rootTarget: Target;
  nestedKeys: (string | symbol)[];
  target: Record<string | symbol, any>;
  args: any[];
  newTarget: Function;
};

type DeepProxyHandler<Target extends object> = {
  getOwnPropertyDescriptor?(args: GetOwnPropertyDescriptorHanderArgs<Target>): PropertyDescriptor | undefined;
  ownKeys?(args: OwnKeysHandlerArgs<Target>): ArrayLike<string | symbol>;
  defineProperty?(args: DefinePropertyHandlerArgs<Target>): boolean;
  deleteProperty?(args: DeletePropertyHandlerArgs<Target>): boolean;
  preventExtensions?(args: PreventExtensionsHandlerArgs<Target>): boolean;
  has?(args: HasHandlerArgs<Target>): boolean;
  get?(args: GetHandlerArgs<Target>): any;
  set?(args: SetHandlerArgs<Target>): boolean;
  apply?(args: ApplyHandlerArgs<Target>): any;
  construct?(args: ConstructHandlerArgs<Target>): object;
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

    return new Proxy(target, proxyHandler);
  }

  return proxify(structuredClone(rootTarget));
}
