import { ScrollView, View } from '@tarojs/components'
import Taro, { useLoad, useUnload } from '@tarojs/taro'
import classnames from 'classnames'
import type { ForwardedRef, PropsWithChildren } from 'react'
import { useState } from 'react'
import Navigate, { GlobalBasePageListener } from '../global/navigate'
import type { DialogContentBuilder } from './baseDialog'
import { BaseDialog, DialogController, DialogStyleEnum } from './baseDialog'
import styles from './basePage.module.less'
import Loading from './loading'

/** 页面组件基础props */
export type TaroPageBaseProps = {
  /** taro 页面 id */
  tid?: string
  /** 函数式组件才会有 */
  forwardedRef?: ForwardedRef<unknown>
  /** 函数式组件才会有 */
  reactReduxForwardedRef?: ForwardedRef<unknown>
}

interface PageProps {
  /** 绑定页面，必须绑定taro的顶层页面 props.tid，才能获取页面唯一性标志 */
  tid?: string
  className?: string
  style?: string
  /** 按钮控制器 */
  dialogs?: DialogController[]
  /** 显示loading */
  loading?: boolean
  loadingOpacity?: number
  loadingText?: string
  /** 审核专用 true--隐藏内容，false-打开内容 */
  isBeautiful?: boolean
}

let globalDefaultDialogBuilder: DialogContentBuilder<boolean, unknown>
/**
 * 注册全局使用的确认弹窗
 * 通常包含“确认”和“取消”按钮
 * 泛型T: 弹窗的配置对象类型
 * @param builder 创建弹窗内容的builder
 */
export function setGlobalDefaultDialogBuilder<T>(builder: DialogContentBuilder<boolean, T>) {
  globalDefaultDialogBuilder = builder
}

/**
 * 一个基础页面，自带一个confirm dialog。
 * 必须使用此页面，才可应用Navigate，showDialog等功能
 *
 * 实现了loading状态，可显示loading文字
 */
export default function BasePage(props: PropsWithChildren<PageProps>) {
  const key = props.tid?.split('?')[0]
  const [pageKey] = useState(key || '')
  const [confirmDialogCt] = useState(
    new DialogController<boolean, unknown>({
      style: DialogStyleEnum.dialog,
      /** 全局弹窗有时会暴露builder，需要设置此参数 */
      allowUseCallbackInCustomDialogProps: true,
      contentBuilder: (ct) => globalDefaultDialogBuilder?.(ct),
    }),
  )

  useLoad(() => {
    if (!key) return
    GlobalBasePageListener.bindPage(key, confirmDialogCt)
  })

  useUnload(() => {
    if (!key) return
    Navigate.removeCompleterOfKey(key)
    GlobalBasePageListener.removePageBind(key)
  })

  const NoContent = (
    <View
      style={{
        width: '100vw',
        marginTop: '80px',
        textAlign: 'center',
      }}
    >
      暂无内容
    </View>
  )

  const loadingStyle = props.loading ? `opacity:${props.loadingOpacity ?? 0.5};pointer-events:none;` : ''
  const children = !props.isBeautiful ? props.children : NoContent
  return (
    <View id={pageKey} className={classnames(props.className, styles.glPage)} style={props.style}>
      {pageKey && TARO_APP_PROJECT_ENV !== 'prod' && <View className={styles.projectEnvTag}>{TARO_APP_PROJECT_ENV}</View>}
      {/* loading位置 */}
      <Loading loading={props.loading} title={props.loadingText} />
      {/* 实际的页面内容 */}
      <View id={styles.pageContent} style={`${loadingStyle}height: auto;`}>
        {Taro.getEnv() === 'WEB' ? (
          children
        ) : (
          <ScrollView scrollY style="width:100vw;height:100%;">
            {children}
          </ScrollView>
        )}
      </View>
      {/* 挂载了全局事件的confirm dialog */}
      <BaseDialog controller={confirmDialogCt} />
      {/* 自定义dialog */}
      {props.dialogs?.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 需要使用索引作为key
        <BaseDialog key={i} controller={item} />
      ))}
    </View>
  )
}
