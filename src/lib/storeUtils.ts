export function makeSeparatedStore<
  T extends(storeKey:string) =>any,
  K extends T extends (storeKey:string) =>infer StoreDef ? StoreDef : never,
>(defineStore:T) {
  const definedStores = new Map<string, K>()

  return (
    storeKey:string
  ):ReturnType<K> => {
    if (!definedStores.has(storeKey)) {
      definedStores.set(storeKey, defineStore(storeKey))
    }

    // @ts-expect-error
    return definedStores.get(storeKey)()
  }
}
