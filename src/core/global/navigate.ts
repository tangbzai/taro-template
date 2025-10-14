import Taro from '@tarojs/taro'
import type { PagePathType } from '@/pageMap'
import { createPromise } from '../tools/createPromise'
import { throttle } from '../tools/debounce'
import type { DialogController } from '../views/baseDialog'

export type NavigateUrlType = PagePathType | `${PagePathType}?${string}`
/**
 * 页面路由导航，带有promise导航功能
 */
export default class Navigate {
  private completerMap: Map<string, PromiseWithResolvers<unknown>> = new Map()
  private backValueMap: Map<string, unknown> = new Map()

  /**
   * Navigate.to
   * 进入一个页面，会同步创建一个promise
   * 在下一页返回时，promise会携带下一页传递的值
   *
   * 例如：
   *
   * // 页面A
   * let user = await Navigate.to('/pages/selectUser/index')
   *
   * // selectUser页
   * Navigate.back({name:'用户名'})
   *
   * 任何其他返回行为都会返回undefined值，请注意判断
   *
   * @param url 目标路径
   * @returns
   */
  static to = throttle(async <T = void>(url: NavigateUrlType) => {
    if (url.indexOf('/') !== 0) {
      throw '【错误】必须使用绝对路径作为url!'
    }
    await _taro.navigateTo({ url: url })
    var completer = createPromise<T | undefined>()
    _pageNavigator.completerMap.set(url.split('?')[0], completer)
    return completer.promise
  }, 300)

  /**
   * Navigate.back
   * 向后退一页，并传递值到上一页
   * @param data 需要传递的值
   */
  static back(data?: unknown): void {
    var key = GlobalBasePageListener.getTopPageKey()?.split('?')[0]
    _taro.navigateBack({ delta: 1 })
    if (!key) return
    if (key.indexOf('/') !== 0) key = `/${key}`
    _pageNavigator.backValueMap.set(key, data)
  }

  /**
   * Navigate.backMultiPages
   * 向后退多页，不能携带任何值
   * 但是之前await的promise仍然会触发(会返回undefined)
   * @param delta 返回的页面数
   */
  static backMultiPages(delta?: number): void {
    _taro.navigateBack({ delta: delta ?? 1 })
  }

  /**
   * Navigate.backUntil
   * 向后退，直到到达指定页面
   * 历史路径将从上一页开始逐个传入checker函数
   * 通过checker函数判断路径，并返回true后，将会返回对应页数
   * @param checker 检查函数
   *
   * 例子：
   * Navigate.backUntil((path) => (path == '/pages/list' || path == '/pages/order'));
   * 将会回到最近的列表或订单页
   */
  static backUntil(checker?: (path: string) => boolean): void {
    const history = GlobalBasePageListener.history
    history.reverse()
    for (let index = 0; index < history.length; index++) {
      if (index === 0) continue // 0是本页
      const path = history[index]
      const isEnd = checker?.(path)
      if (isEnd) {
        Navigate.backMultiPages(index)
        break
      }
    }
  }

  /**
   * Navigate.backToHome
   * 回到当前页面堆栈的首页
   * 区别于relaunch，只是单纯的back多层页面
   */
  static backToHome() {
    Navigate.backMultiPages(GlobalBasePageListener.history.length - 1)
  }

  /**
   * Navigate.redirect
   * 重新进入一页
   * @param data
   */
  static redirect(url: NavigateUrlType): void {
    _taro.redirectTo({ url: url })
  }

  /**
   * Navigate.reLaunch
   * 重启App并重新进入
   * 如果不指定路径，默认会进入当前最底部的页面
   * @param data
   */
  static reLaunch(url?: string): void {
    // _taro.reLaunch({ url: url ?? GlobalBasePageListener.rootPagePath });
    const firstPageUrl = GlobalBasePageListener.rootPagePath
    _taro.reLaunch({ url: url ?? firstPageUrl })
  }

  /**
   * 显示全局的弹窗
   * @param config
   * @returns
   */
  static showGlobalDialog<T = void>(config: T, barrierDismissible?: boolean) {
    return GlobalBasePageListener.showTopPageDialog<T>(config, barrierDismissible)
  }

  /**
   * 设置被动返回时的返回值，应只在WebView页使用
   * WebView页同样需要嵌套BasePage
   * 只用于WebView中，在返回前传递postMessage的值到前一页
   * 在WebView中，应当只在返回时设置一次值，不应多次设置
   * @param config
   * @returns
   */
  static setBackNavigateValueForWebView(data?: unknown) {
    var key = GlobalBasePageListener.getTopPageKey()?.split('?')[0]
    if (!key) return
    if (key.indexOf('/') !== 0) key = `/${key}`
    if (_pageNavigator.backValueMap.get(key) === undefined) {
      _pageNavigator.backValueMap.set(key, data)
    } else {
      let errText = '错误：不应多次设置返回值。'
      errText += '应当在wx.miniProgram.navigateBack前，'
      errText += '调用postMessage发送一个仅用于返回的数据，返回时在bindMessage中取出该数据调用本方法(仅可调用一次)。'
      _pageNavigator.backValueMap.set(key, { err: errText })
      throw errText
    }
  }

  /** 移除掉completer(用于被动触发) */
  static removeCompleterOfKey(key: string) {
    if (key.indexOf('/') !== 0) key = `/${key}`
    setTimeout(() => {
      if (!key || !_pageNavigator.completerMap.get(key)) return
      const value = _pageNavigator.backValueMap.get(key)
      _pageNavigator.completerMap.get(key)?.resolve(value)
      _pageNavigator.completerMap.delete(key)
      _pageNavigator.backValueMap.delete(key)
    }, 10)
  }
}

const _pageNavigator = new Navigate()

/**
 * 将taro的方法取出来
 */
const _taro = {
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  redirectTo: Taro.redirectTo,
  reLaunch: Taro.reLaunch,
}

type DialogCaller = DialogController<boolean, unknown>

/**
 * 监听页面堆栈变化，获取最顶层的页面，在showDialog时，回调该页面的dialog
 */
export class GlobalBasePageListener {
  /** 弹窗监听 */
  private dialogListener: Map<string, DialogCaller> = new Map()

  static bindPage(key: string, onDialogShow: DialogCaller) {
    if (!key) return
    if (key.indexOf('/') !== 0) key = `/${key}`
    _globalBasePageListener.dialogListener.set(key, onDialogShow)
  }
  static removePageBind(key: string) {
    if (key.indexOf('/') !== 0) key = `/${key}`
    _globalBasePageListener.dialogListener.delete(key)
  }

  static getTopPageKey() {
    const list = Array.from(_globalBasePageListener.dialogListener.keys())
    if (list.length === 0) return undefined
    return list[list.length - 1]
  }

  /** 获取全局的确认弹窗 */
  static getTopPageValue() {
    const dialogList: (DialogCaller | undefined)[] = Array.from(_globalBasePageListener.dialogListener.values())
    return dialogList[dialogList.length - 1]
  }

  /** 显示全局的确认弹窗 */
  static showTopPageDialog<T>(config: T, barrierDismissible?: boolean) {
    const dialog = GlobalBasePageListener.getTopPageValue()
    if (!dialog) return undefined
    dialog.barrierDismissible = barrierDismissible ?? true
    return dialog.show(undefined, config)
  }

  /** 能否回退到上一页，就是判断当前是否只有一页在堆栈内 */
  static get canNavigateBack() {
    const list = Array.from(_globalBasePageListener.dialogListener.keys())
    return list.length > 1
  }

  /** 历史记录 */
  static get history() {
    const list = Array.from(_globalBasePageListener.dialogListener.keys())
    return list
  }

  /** 获取最底部的页面 */
  static get rootPagePath() {
    const list = Array.from(_globalBasePageListener.dialogListener.keys())
    return `${list[0]}`
  }
}
/** 页面监听的缓存 */
const _globalBasePageListener = new GlobalBasePageListener()

// 清除自带的导航方法
Taro.navigateTo = async (_) => {
  throw '\n错误: 请不要使用Taro自带的navigateTo,\n请使用 Navigate.to 代替'
}
Taro.navigateBack = async (_) => {
  throw '\n错误: 请不要使用Taro自带的navigateBack,\n请使用 Navigate.back 代替'
}
Taro.redirectTo = async (_) => {
  throw '\n错误: 请不要使用Taro自带的redirectTo,\n请使用 Navigate.redirect 代替'
}
Taro.reLaunch = async (_) => {
  throw '\n错误: 请不要使用Taro自带的reLaunch,\n请使用 Navigate.reLaunch 代替'
}
const _getCurrentInstance = Taro.getCurrentInstance
Taro.getCurrentInstance = () => {
  return Object.assign({}, _getCurrentInstance())
}
