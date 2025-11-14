import Taro from '@tarojs/taro'

/** 本地缓存的属性，如果没有默认值，请设置为可空 */
type LocalCacheInfo = {
  token: string | null
} // 添加缓存key，去掉项目中零散的localStorage

/** 各个属性的默认值，可不设置 */
const cacheInfo: Partial<LocalCacheInfo> = {}

/**
 * 本地缓存的代理对象
 *
 * 使用方法：
 * // 保存一个值到本地(LocalStorage)
 * LocalCache.token = 'aaa';
 *
 * // 从LocalStorage读取一个值
 * let token = LocalCache.token;
 */
export const LocalCache = createCacheProxy(cacheInfo)

/** 创建本地缓存代理 */
function createCacheProxy<T extends object>(defaultValue: Partial<T>) {
  return new Proxy<T>(defaultValue as T, {
    get(old, key) {
      var cacheValue = Taro.getStorageSync(key as string)
      return cacheValue ?? old[key]
    },
    set(_, key, newValue) {
      Taro.setStorageSync(key as string, newValue)
      return true
    },
  })
}
