import PAGE_MAP, { PageType, SUB_PACKAGES } from "./pageMap";
const ALL_PAGES = Array.from(new Set(Object.values(PAGE_MAP).flat()));

/** 获取页面路径 */
function getPagesPath(pages: PageType[]): PageType["path"][] {
  return pages.map(({ path }) => path);
}

export default defineAppConfig({
  pages: getPagesPath(PAGE_MAP[`${process.env.TARO_ENV}`] ?? ALL_PAGES),
  subPackages: SUB_PACKAGES.map(({ pages, ...item }) => ({
    ...item,
    pages: getPagesPath(pages),
  })),
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
});
