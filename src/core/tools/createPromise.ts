export function createPromise<T>(): PromiseWithResolvers<T> {
  // es2024后添加的 withResolvers 方法
  if ('withResolvers' in Promise && Promise.withResolvers()) return Promise.withResolvers()
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return {
    promise,
    resolve,
    reject,
  }
}
