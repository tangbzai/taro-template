# 核心框架封装

本框架对 taro 原本体系扩展了一些新的封装，支持同时在小程序/H5 中使用，提供以下功能：

1. 全局自定义弹窗（不操作 dom），可选 dialog，bottomSheet，custom 样式。
2. promise 路由功能，在 push 时返回一个 promise，await 这个 promise 即可获取到下一页 back 回传数据。
3. 另外封装了现成的页面 loading 效果。

## 主要功能

### BasePage 页面

使用本框架，每一个页面在外层都需要带有 BasePage:

```tsx
  render() {
    return (
      <BasePage tid={this.props.tid}>
        <View className='index-pages'>
        </View>
      </BasePage>
    );
  }
```

`BasePage`使用注意：

- 需要写`tid={this.props.tid}`，此属性支持嵌套使用，即`BasePage`内部再套`BasePage`也不会有任何问题，仅对页面组件下的`BasePage`产生影响。

`BasePage`的属性，支持插入`DialogController`来完成自定义弹窗

```tsx
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
```

### Navigate 路由

小程序/H5 在下一页往上一页传值十分困难，借鉴了 Flutter 设计的写法，本框架可以这样跨页面传值

```tsx
// Navigate.to
// 进入一个页面，会同步创建一个promise
// 在下一页返回时，promise会携带下一页传递的值

// 例如：

// 页面A，这个promise会等待下一页传值后resolve
const user = await Navigate.to('/pages/selectUser/index')

// selectUser页往回传值
Navigate.back({ name: '用户名' })

// 任何其他返回行为都会返回undefined值，请注意判断
```

引入路由后，Taro 原本的路由方法会被取消，调用将会 throw，不会因为混用导致问题。

### BaseDialog 弹窗

弹窗是一个常见需求，与路由类似，弹窗也能通过 promise 返回值。

在本框架中，弹窗分为全局弹窗和自定义弹窗两种

#### 全局弹窗

BasePage 自带一个 dialog(默认 dialog)，可以指定全局方法来触发。

一个全局弹窗封装例子如下：

```tsx
/// 弹窗的配置选项
export interface DialogConfig {
  /** 弹窗标题 */
  title?: string
}

// 显示全局弹窗，这是个自定义的全局方法
// 使用时应该自己封装一个顶层方法，因为Navigate.showGlobalDialog始终需要传递泛型
export function showConfirmDialog(config: DialogConfig) {
  return Navigate.showGlobalDialog<DialogConfig>(config)
}

// 使用一个立即执行方法，把全局弹窗设置到page中
;(() => {
  setGlobalDefaultDialogBuilder<DialogConfig>((ct) => <SimpleConfirmDialog ct={ct} />)
})()

// 全局弹窗本身可以是一个function component，也可以是class component
// 必须接受DialogController
// controller使用：
// 获取自定义配置：props.ct.config
// 使用props.ct.complete(values)回传values
// 使用props.ct.close()立即关闭弹窗
export function SimpleConfirmDialog(props: { ct: DialogController<boolean, DialogConfig> }) {
  const config = props.ct.config
  return (
    <View className="simple-confirm-dialog">
      <View className="dialog-title">{ct.title}</View>
      <View className="modal"></View>
    </View>
  )
}
```

#### 自定义弹窗

在页面内，很简单就能插入自定义弹窗，只需要创建一个 自定义 DialogController，再添加给 BasePage 的 dialogs

```tsx
// 1.创建自定义DialogController
const customDialog = useRef(new DialogController<dialog>({
  style: DialogStyleEnum.bottomSheet,
  /// TestDialog是自定义组件，接收一个TestDialog
  contentBuilder: (ct) => <TestDialog ct={ct} />,
}))

// 2.添加到BasePage的dialog
;<BasePage tid={props.tid} dialogs={[customDialog.current]}></BasePage>

// 3. 使用
customDialog.current.show()
```

## 文件结构

```bash
./src/core
├── README.md
├── global
│   └── navigate.ts # 导航的封装
├── tools
│   ├── cache.ts # 缓存封装
│   └── createPromise.ts # Promise.withResolvers 封装
└── views
    ├── baseDialog.tsx # dialog逻辑封装
    ├── basePage.tsx # 页面的基础封装，如果要使用路由功能必须套这个组件，详见example
    ├── loading.tsx # 页面加载动画
```
