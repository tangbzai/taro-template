import { Image, View } from '@tarojs/components'
import classNames from 'classnames'
import Assets from '@/assets'
import Navigate from '@/core/global/navigate'
import type { DialogController } from '@/core/views/baseDialog'
import { setGlobalDefaultDialogBuilder } from '@/core/views/basePage'
import styles from './simpleConfirmDialog.module.less'

export interface DialogConfig {
  /** 弹窗标题 */
  title?: string
  /** 弹窗内容 */
  content?: string | (() => JSX.Element)
  /** 内容样式 */
  contentStyle?: string | React.CSSProperties | undefined
  /** 是否隐藏底部区域 */
  hideFooter?: boolean
  /** 取消按钮文字 默认：取消*/
  cancelText?: string
  /** 取消按钮自定义样式 {color:'red',background:'green'} */
  cancelBtnStyle?: string | React.CSSProperties | undefined
  /** 确认按钮文字 默认：确认 */
  confirmText?: string
  /** 确认按钮自定义样式 {color:'red',background:'green'} */
  confirmBtnStyle?: string | React.CSSProperties | undefined
  /** 是否隐藏右上角关闭按钮*/
  hideCloseIcon?: boolean
  /** 是否含有取消按钮 */
  hasCancelButton?: boolean
}

export function showConfirmDialog(config: DialogConfig, barrierDismissible?: boolean) {
  return Navigate.showGlobalDialog<DialogConfig>(config, barrierDismissible)
}
/// 加载到Page的默认弹窗
;(() => {
  setGlobalDefaultDialogBuilder<DialogConfig>((ct) => <SimpleConfirmDialog ct={ct} />)
})()

export function SimpleConfirmDialog(props: { ct: DialogController<boolean, DialogConfig> }) {
  const config = props.ct.config

  return (
    <View className={styles.simpleConfirmDialog}>
      <View className={classNames(styles.dialog, styles.dialogFadeEnterActive)}>
        {!config?.hideCloseIcon && (
          <Image className={styles.closeIcon} src={Assets.DialogClose} onClick={() => props.ct.complete()}></Image>
        )}
        <View className={classNames(styles.title, 't-bold')}>{config?.title ?? ''}</View>
        <View className={styles.content} style={config?.contentStyle}>
          {typeof config?.content === 'function' ? config.content() : config?.content}
        </View>

        {!config?.hideFooter && (
          <View className={styles.footer}>
            <View className={styles.operation}>
              {config?.hasCancelButton && (
                <View
                  className={styles.cancelBtn}
                  style={config?.cancelBtnStyle}
                  onClick={() => {
                    props.ct.complete(false)
                  }}
                >
                  {config?.cancelText ?? '取消'}
                </View>
              )}
              <View
                className={styles.confirmBtn}
                style={config?.confirmBtnStyle ?? `width:${config?.hasCancelButton ? '50%' : '100%'}`}
                onClick={() => props.ct.complete(true)}
              >
                {config?.confirmText ?? '确认'}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
