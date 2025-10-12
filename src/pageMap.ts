import type { AppConfig } from "@tarojs/taro";

type TaroEnvType = typeof process.env.TARO_ENV;

export type PageType = {
  path: `pages/${string}`;
  name: string;
};

const PAGE_MAP = {
  weapp: [{ path: "pages/index/index", name: "首页" }],
  h5: [{ path: "pages/index/index", name: "首页" }],
} as const satisfies Partial<Record<TaroEnvType, PageType[]>>;

export const SUB_PACKAGES = [
  {
    root: "packageDemo",
    pages: [{ path: "pages/index/index", name: "首页" }],
  },
] as const satisfies CoverPart<
  NonNullable<AppConfig["subPackages"]>[number],
  { pages: PageType[] }
>[];

export default PAGE_MAP;
export type PageMapType = typeof PAGE_MAP;
export type SubPackageType = typeof SUB_PACKAGES;

/** 所有页面路径的类型 */
export type PagePathType =
  // 主包页面路径
  | `/${PageMapType[keyof PageMapType][number]["path"]}`
  // 分包页面路径
  | {
      [Root in SubPackageType[number]["root"]]: Root extends SubPackageType[number]["root"]
        ? {
            [Index in keyof SubPackageType]: SubPackageType[Index] extends {
              root: Root;
              pages: infer Pages extends PageType[];
            }
              ? `/${Root}/${Pages[number]["path"]}`
              : never;
          }[keyof SubPackageType]
        : never;
    }[SubPackageType[number]["root"]];
