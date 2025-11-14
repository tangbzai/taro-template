import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import type { TaroPluginAssetsOptions } from 'taro-plugin-assets-indexer'
import devConfig from './dev'
import prodConfig from './prod'

/** 创建子目录别名 */
function createSubAlias(basePath: string, options?: { prefix?: string; includes?: string[]; excludes?: string[] }) {
  /** 需要滤掉的目录/文件名称 */
  /** 获取目标目录底下的名称列表，并过滤掉部分 */
  const subDir = readdirSync(basePath).filter((name) => !options?.excludes?.includes(name))
  /** 返回别名配置 */
  return subDir.reduce((acc, dirName) => {
    const key = `${options?.prefix || '@/'}${dirName.replace(/\.(j|t)sx?$/, '')}`
    acc[key] = resolve(basePath, dirName)
    return acc
  }, {})
}

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge, { mode }) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'taro-template',
    date: '2025-10-10',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-generator', ['taro-plugin-assets-indexer', {} satisfies TaroPluginAssetsOptions]],
    defineConstants: {
      TARO_APP_PROJECT_ENV: `"${process.env.TARO_APP_PROJECT_ENV}"`,
    },
    copy: {
      patterns: [],
      options: {},
    },
    alias: {
      ...createSubAlias(resolve(__dirname, '../src')),
    },
    framework: 'react',
    compiler: 'vite',
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      devServer: {
        open: false,
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  }

  if (mode === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
