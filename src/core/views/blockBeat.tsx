import { View } from '@tarojs/components'
import classnames from 'classnames'
import type { ReactNode } from 'react'
import styles from './blockBeat.module.less'

interface BlockBeatProps {
  className?: string
  center?: boolean
  move?: boolean
  content?: ReactNode
}

export default function BlockBeat(props: BlockBeatProps) {
  return (
    <View className={classnames(props.className, styles.blockBeat, { [styles.center]: props.center })}>
      <View className={classnames(styles.loader, { [styles.move]: props.move })}>
        <View className={styles.shadow} />
        <View className={styles.box} />
      </View>
      <View className={styles.loadingText}>{props.content}</View>
    </View>
  )
}
