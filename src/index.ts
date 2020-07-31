const getKeys = <T extends {}>(o: T): Array<keyof T> => Object.keys(o) as Array<keyof T>;

type AnyFunction = (...args: any[]) => any;
type GetReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R ? R : any;

export type CacheType = {
  get: (key: string) => { value: any; until: number } | undefined;
  set: (key: string, obj: { value: any; until: number }) => any;
};

export const timeCacheResult = <T extends AnyFunction>(
  cache: CacheType,
  func: T,
  { cacheTime = CACHE_DURATION.AVERAGE, nameToCache }: { cacheTime?: number; nameToCache?: string },
): T => {
  return function (...args: any[]) {
    const curTime = new Date().getTime();
    const hash = (nameToCache || func.name) + [].join.call(args);
    const cacheEntry = cache.get(hash);
    if (cacheEntry !== undefined && cacheEntry.until > curTime) {
      return cacheEntry.value as GetReturnType<T>;
    } else {
      const result = func.apply(this, args);
      cache.set(hash, {
        until: curTime + cacheTime,
        value: result,
      });
      return result as GetReturnType<T>;
    }
  } as T;
};

/**
 *
 * @param store le store
 * @param mapping mapping nom de fonction en cache => nom de variable dans le store (observable)
 */
export const createCache = <T extends {}>(store: T, mapping: { [key: string]: keyof T }): CacheType => {
  const internalCache: Map<string, number> = new Map();

  /**
   *
   * @param key Func name + arguments (hash). Ex: "myFunc,2"
   */
  const get = (key: string) => {
    const cacheEntry = internalCache.get(key);
    if (cacheEntry) {
      const mappingKeyList = getKeys(mapping) as string[];
      for (let i = 0, n = mappingKeyList.length; i < n; i++) {
        if (key.includes(mappingKeyList[i])) {
          const storeKey = mapping[mappingKeyList[i]];
          return {
            until: cacheEntry,
            value: store[storeKey],
          };
        }
      }
    }
    return undefined;
  };
  /**
   *
   * @param key Func name + arguments (hash). Ex: "myFunc,2"
   * @param obj value is the stored value which will get returned, until is used to invalidate cache result
   */
  const set = (key: string, obj: { value: any; until: number }) => {
    internalCache.set(key, obj.until);
  };
  return {
    get,
    set,
  };
};

export const CACHE_DURATION = {
  LONG: 60000,
  AVERAGE: 10000,
  FAST: 1000,
};
