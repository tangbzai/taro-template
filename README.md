# Taro 多端统一开发模板项目

[![Taro](https://img.shields.io/badge/Taro-4.x-%2361dafb)](https://github.com/NervJS/taro)
[![React](https://img.shields.io/badge/React-18.x-%2361dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-^5.x-blue)](https://www.typescriptlang.org/)

一款基于 Taro 框架构建的开箱即用的多端统一开发模板，支持微信小程序、H5、React Native 等多个平台。

## 🎯 特性

- ✅ 多端支持：一套代码同时构建到多个平台
- ✅ TypeScript 全面支持
- ✅ React 18 函数组件 + Hooks
- ✅ Less CSS 预处理器
- ✅ 现代化的开发工具链（Biome、Commitlint、Husky）
- ✅ Git 提交规范校验（Commitlint + Husky）
- ✅ 内置常用工具库和组件库

## 🚀 支持平台

| 平台              | 构建命令                  | 开发命令                    |
|-------------------|---------------------------|-----------------------------|
| 微信小程序        | `pnpm build:weapp`        | `pnpm dev:weapp`            |
| 百度智能小程序    | `pnpm build:swan`         | `pnpm dev:swan`             |
| 支付宝小程序      | `pnpm build:alipay`       | `pnpm dev:alipay`           |
| 字节跳动小程序    | `pnpm build:tt`           | `pnpm dev:tt`               |
| QQ 小程序         | `pnpm build:qq`           | `pnpm dev:qq`               |
| 京东小程序        | `pnpm build:jd`           | `pnpm dev:jd`               |
| H5                | `pnpm build:h5`           | `pnpm dev:h5`               |
| React Native      | `pnpm build:rn`           | `pnpm dev:rn`               |
| HarmonyOS Hybrid  | `pnpm build:harmony-hybrid` | `pnpm dev:harmony-hybrid` |

## 📦 技术栈

- 核心框架：[Taro](https://github.com/NervJS/taro)
- 渲染框架：[React](https://react.dev/)
- 包管理器：[pnpm](https://pnpm.io/)
- 语言：TypeScript
- 样式：Less
- 构建工具：Vite
- 代码规范：Biome
- Git 钩子：Husky

## 🚀 快速开始

### 环境准备

确保你的开发环境中已经安装了以下工具：

- Node.js (推荐 LTS 版本)
- pnpm (推荐使用 npm i -g pnpm 安装)

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

以微信小程序为例：

```bash
pnpm dev:weapp
```

对于其他平台，请参考上面的[支持平台](#支持平台)表格。

### 构建生产版本

同样以微信小程序为例：

```bash
pnpm build:weapp
```

构建产物将输出到 `dist/[platform]` 目录下。

## 🧱 项目结构

```
.
├── config                   # 构建配置目录
│   ├── dev.ts              # 开发环境配置
│   ├── index.ts            # 基础配置
│   └── prod.ts             # 生产环境配置
├── src                     # 源代码目录
│   ├── core                # 核心工具和基类
│   │   ├── global          # 全局工具
│   │   ├── tools           # 工具函数
│   │   └── views           # 基础视图组件
│   ├── packageDemo         # 示例分包
│   ├── pages               # 主包页面
│   └── views               # 业务组件
├── types                   # 类型定义文件
├── dist                    # 构建产物目录（构建后生成）
└── ...
```

## 🔧 核心功能

### 路径别名

项目支持 `@/` 路径别名，可以直接引用 src 目录下的文件，例如：

```typescript
import MyComponent from '@/components/MyComponent'
```

### 内置工具

项目内置了一些常用的工具函数：

- [缓存管理](./src/core/tools/cache.ts)：基于 Taro 的本地存储封装
- [防抖/节流](./src/core/tools/debounce.ts)：防止函数重复执行
- [单例代理](./src/core/tools/singletonProxy.ts)：创建单例模式对象
- [异步 Promise](./src/core/tools/createPromise.ts)：创建可控制的 Promise 对象

### 基础组件

- [BasePage](./src/core/views/basePage.tsx)：页面基础组件，提供 loading 状态、弹窗管理等
- [BaseDialog](./src/core/views/baseDialog.tsx)：弹窗基础组件，支持多种弹窗样式
- [Loading](./src/core/views/loading.tsx)：加载指示器组件

## ⚙️ 代码规范

项目使用现代化的代码规范工具：

- [Biome](https://biomejs.dev/)：一体化的代码格式化、lint 和修复工具

Biome 提供了以下命令：

```bash
# 检查代码问题
pnpm lint

# 格式化代码
pnpm format

# 检查代码并显示问题
pnpm check

# 检查并自动修复问题
pnpm check:fix
```

所有规范都会通过 Git 钩子自动执行。
