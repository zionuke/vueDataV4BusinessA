const theme = {
  dark: {
    // 背景颜色
    backgroundColor: "#161522",
    // 标题文字颜色
    titleColor: "#FFFFFF",
    // 切换主题按钮的图片路径
    themeSrc: "qiehuan_dark.png",
    // 页面顶部的边框图片
    headerBorderSrc: "header_border_dark.png",
  },
  vintage: {
    // 背景颜色
    backgroundColor: "#dddddd",
    // 标题文字颜色
    titleColor: "#000000",
    // 切换主题按钮的图片路径
    themeSrc: "qiehuan_light.png",
    // 页面顶部的边框图片
    headerBorderSrc: "header_border_light.png",
  },
};

export function getThemeValue (themeName) {
  return theme[themeName]
}
