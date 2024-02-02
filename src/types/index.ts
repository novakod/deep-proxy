type GetOwnPropertyDescriptorHanderArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
};

type OwnKeysHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
};

type DefinePropertyHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
  descriptor: PropertyDescriptor;
};

type DeletePropertyHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
};

type PreventExtensionsHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
};

type HasHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
};

type GetHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
  reciever: any;
};

type SetHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  key: string | symbol;
  value: any;
  reciever: any;
};

type ApplyHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  thisArg: any;
  args: any[];
};

type ConstructHandlerArgs<Target extends object> = {
  rootTarget: Target;
  path: (string | symbol)[];
  target: Record<string | symbol, any>;
  args: any[];
  newTarget: Function;
};

export type DeepProxyHandler<Target extends object> = {
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
