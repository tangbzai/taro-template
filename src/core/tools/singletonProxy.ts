export default function singletonProxy<T extends new (...args: unknown[]) => R, R extends object>(classTarget: T): T {
  let instance: R | null = null
  return new Proxy(classTarget, {
    construct(target, args) {
      if (!instance) {
        instance = new target(...args)
      }
      return instance
    },
  })
}
