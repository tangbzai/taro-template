import { RootPortal, View } from '@tarojs/components'
import classnames from 'classnames'
import { memo, type ReactElement, useEffect, useRef, useState } from 'react'
import { createPromise } from '../tools/createPromise'
import styles from './baseDialog.module.less'

export type DialogContentBuilder<T, E> = (controller: DialogController<T, E>) => ReactElement

export enum DialogStyleEnum {
  custom,
  dialog,
  bottomSheet,
}

/**
 * 渲染弹窗
 * 仅包含遮罩层和布局，不包含UI样式
 */
export const BaseDialog = memo(
  (props: {
    /** 弹窗控制器 */
    controller: DialogController<unknown, unknown>
  }) => {
    const { controller } = props
    const content = controller._internalDialogContentBuilder?.(controller)
    const [, setState] = useState(0)
    useEffect(() => {
      controller.bindRefreshFn(() => setState((old) => old + 1))
      return () => {
        controller.removeBindRefreshFn()
      }
    }, [controller])
    const { isShow } = controller
    const [destructionContent, setDestructionContent] = useState(true)
    const timeRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
      clearTimeout(timeRef.current ?? void 0)
      if (isShow) {
        setDestructionContent(false)
        return
      }
      timeRef.current = setTimeout(() => {
        if (!controller.keepDialogStateAlive) setDestructionContent(true)
      }, controller.delayDestruction) // 时间需要大于 less 文件的 @duration 变量 否则会在动画执行结束前销毁掉元素
      return () => clearTimeout(timeRef.current ?? void 0)
    }, [controller.keepDialogStateAlive, controller.delayDestruction, isShow])

    if (!controller.allowUseCallbackInCustomDialogProps) {
      for (const value of Object.values(content?.props ?? {})) {
        if (typeof value !== 'function') continue
        throw '[Error]Dialog MUST NOT has callback function in props.\n[错误]自定义dialog的props不可传入回调函数.'
      }
    }
    if (controller.style === DialogStyleEnum.custom) {
      if (['weapp', 'alipay'].includes(process.env.TARO_ENV)) return <RootPortal>{content}</RootPortal>
      return content
    }
    // 初次渲染时，隐藏遮罩，避免开始渲染时，遮罩会播放一次hide动画
    const firstRenderHiddenStyle = isShow === void 0 ? 'display:none;' : ''
    const finalStyle = `${firstRenderHiddenStyle}z-index: ${controller.zIndex}`
    const dialogComponent = (
      <View
        className={classnames({
          [styles.bottomSheet]: controller.style === DialogStyleEnum.bottomSheet,
          [styles.centerSheet]: controller.style === DialogStyleEnum.dialog,
          [styles.hide]: isShow === false,
          [styles.show]: isShow,
        })}
        style={finalStyle}
        onClick={() => {
          if (controller.barrierDismissible) controller.close()
        }}
      >
        <View
          className={styles.dialogCard}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {!destructionContent && content}
        </View>
      </View>
    )
    if (['weapp', 'alipay'].includes(process.env.TARO_ENV)) return <RootPortal>{dialogComponent}</RootPortal>
    return dialogComponent
  },
)

/**
 * 弹窗控制器
 * 泛型T: 返回值/初始值的类型
 * 泛型E: 弹窗配置对象的类型
 */
export class DialogController<T = void, E = void> {
  constructor(args?: {
    contentBuilder?: DialogContentBuilder<T, E>
    style?: DialogStyleEnum
    /** 允许在自定义弹窗中使用callback，弹窗通常被认为是独立层，不设置此属性就传入callback将会报错 */
    allowUseCallbackInCustomDialogProps?: boolean
    /** 默认z-index层级 */
    zIndex?: number
    /** 可点击蒙层关闭弹窗，默认是true */
    barrierDismissible?: boolean
    /** 是否保持dialog状态，如果选择true，需要监听componentDidUpdate生命周期 */
    keepDialogStateAlive?: boolean
  }) {
    this.keepDialogStateAlive = args?.keepDialogStateAlive ?? false
    this.style = args?.style ?? DialogStyleEnum.dialog
    this._internalDialogContentBuilder = args?.contentBuilder
    this.zIndex = args?.zIndex ?? 99
    this.barrierDismissible = args?.barrierDismissible ?? true
  }

  /** 初始值 */
  data?: T

  /** 弹窗配置值 */
  config?: E

  /** 是否保持dialog状态，如果选择true，需要监听componentDidUpdate生命周期 */
  keepDialogStateAlive?: boolean

  /** 延迟销毁弹窗，单位毫秒，默认200 */
  delayDestruction: number = 200

  /** 允许在自定义弹窗中使用callback，弹窗通常被认为是独立层，使用callback将会报错 */
  allowUseCallbackInCustomDialogProps: boolean

  /** 当前显示弹窗的形式 */
  style: DialogStyleEnum

  /** 当前显示的z-index的层级 */
  zIndex: number

  /** 可点击蒙层关闭弹窗 */
  barrierDismissible: boolean

  private completer: PromiseWithResolvers<T | undefined | null>

  private onShowChange?: (show: boolean) => void

  /**
   * 使用前需要在componentDidMount中，先绑定
   */
  async bindRefreshFn(refreshFn: () => void) {
    this.onShowChange = refreshFn
  }
  async removeBindRefreshFn() {
    this.onShowChange = undefined
  }

  async show(initialData?: T, customData?: E) {
    if (this.onShowChange === undefined) {
      throw '[ERROR!!] Must call controller.bind(this) before show.'
    }
    this.data = initialData
    this.config = customData
    this._internalDialogInfoUpdate?.()
    this._internalShowDialog()
    this.completer = createPromise()
    var res = await this.completer.promise
    this._internalHideDialog()
    return res
  }

  /** 完成并关闭弹窗 */
  complete(result?: T) {
    this.completer.resolve(result)
  }

  close() {
    this.complete()
  }

  /** 查看dialog是否显示 */
  get isShow() {
    return this._internalDialogShow
  }

  //
  // internal functions
  //

  _internalDialogContentBuilder?: DialogContentBuilder<T, E>

  _internalDialogInfoUpdate: () => void

  _internalDialogShow: boolean

  _internalShowDialog() {
    this._internalDialogShow = true
    this.onShowChange?.(this._internalDialogShow)
  }

  _internalHideDialog() {
    this._internalDialogShow = false
    this.completer.resolve(null)
    this.onShowChange?.(this._internalDialogShow)
  }
}
