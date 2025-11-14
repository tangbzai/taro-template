import { View } from '@tarojs/components'
import { Component } from 'react'
import BlockBeat from '@/core/views/blockBeat'
import styles from './loading.module.less'

interface _Props {
  loading?: boolean
  title?: string
}

export default class Loading extends Component<_Props> {
  render() {
    if (!this.props.loading) return <></>
    return (
      <View className={styles.loadingBackground}>
        <View className={styles.content}>
          <BlockBeat center className={styles.loading} content={this.props.title ?? '加载中...'} />
        </View>
      </View>
    )
  }
}
