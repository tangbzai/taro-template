/**
 * 防抖函数(可用于防止重复提交)
 * 当持续触发事件时，一定时间段内没有再触发事件，事件处理函数才会执行一次，
 * 如果设定时间到来之前，又触发了事件，就重新开始延时。也就是说当一个用户一直触发这个函数，
 * 且每次触发函数的间隔小于既定时间，那么防抖的情况下只会执行一次。
 *
 * @param func 执行函数
 * @param delay 间隔时间 (可选) 默认300ms
 * @param immediate 立即执行 (可选) 默认true
 */
export function debounce<T, R>(fn: (...arg: T[]) => R, delay: number = 300, immediate: boolean = true) {
  let debounceTimer: NodeJS.Timeout | null
  return function (...args: T[]) {
    if (debounceTimer) clearTimeout(debounceTimer) // 存在就清除执行fn的定时器
    if (immediate) {
      // 立即执行
      const callNow = !debounceTimer // 执行fn的状态
      debounceTimer = setTimeout(() => {
        debounceTimer = null
      }, delay)
      if (callNow) {
        fn.apply(this, args)
      }
    } else {
      // 非立即执行
      debounceTimer = setTimeout(() => {
        // 或者使用箭头函数将this指向dom
        debounceTimer = null
        fn.apply(this, args)
      }, delay)
    }
  }
}

/**
 * 节流函数
 *
 * @param func 执行函数
 * @param delay 间隔时间 (可选) 默认300ms
 * @param immediate 立即执行 (可选) 默认true
 */
export function throttle<T, F extends (...arg: unknown[]) => T>(fn: F, delay?: number, immediate?: true): F
export function throttle<T, F extends (...arg: unknown[]) => T>(
  fn: F,
  delay: number,
  immediate: false,
): (...arg: Parameters<F>) => Promise<ReturnType<F>>
export function throttle<T, F extends (...arg: unknown[]) => T>(fn: F, delay: number = 300, immediate: boolean = true) {
  let throttleTimer: NodeJS.Timeout | null
  return function (...args) {
    if (throttleTimer) return
    if (immediate) {
      // 立即执行
      throttleTimer = setTimeout(() => {
        throttleTimer = null
      }, delay)
      return fn.apply(this, args)
    }
    return new Promise<ReturnType<F>>((resolve) => {
      // 非立即执行
      throttleTimer = setTimeout(() => {
        // 或者使用箭头函数将this指向dom
        throttleTimer = null
        resolve(fn.apply(this, args))
      }, delay)
    })
  }
}
