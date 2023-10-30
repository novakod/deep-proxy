export function getTargetKeys<T extends object>(target: T): Exclude<keyof T, symbol | number>[] {
  return Object.keys(target) as Exclude<keyof T, symbol | number>[];
}
