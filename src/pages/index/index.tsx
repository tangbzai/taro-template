import { Text, View } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import BasePage, { type TaroPageBaseProps } from '@/core/views/basePage'
import styles from './index.module.less'

export default function Index(props: TaroPageBaseProps) {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <BasePage tid={props.tid} className={styles.index}>
      <View>
        <Text>Hello world!</Text>
      </View>
    </BasePage>
  )
}
