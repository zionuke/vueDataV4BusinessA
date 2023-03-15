// 生产环境标记
const IS_PRODUCTION = process.env.NODE_ENV === "production";
// 配置引用cdn的js、css地址
const cdn = {
  css: [],
  js: [
    "https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.min.js",
    "https://cdn.bootcdn.net/ajax/libs/vue-router/3.2.0/vue-router.min.js",
    "https://cdn.bootcdn.net/ajax/libs/vuex/3.4.0/vuex.min.js",
    "https://cdn.bootcdn.net/ajax/libs/axios/1.3.4/axios.min.js",
    "https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts.min.js",
  ],
};
// 配置打包时使用CDN节点（加入externals外部扩展）， 忽略打包的第三方库
// 左面放package.json中的扩展的名称,右面放项目依赖的名称(项目初始化要用的名称)
const externals = {
  // 属性名称 vue, 表示遇到 import xxx from 'vue' 这类引入 'vue'的，不去 node_modules 中找，而是去找全局变量 Vue（其他的为VueRouter、Vuex、axios、ELEMENT、echarts，注意全局变量是一个确定的值，不能修改为其他值，修改为其他大小写或者其他值会报错，若有异议可留言）
  vue: "Vue",
  "vue-router": "VueRouter",
  vuex: "Vuex",
  axios: "axios",
  echarts: "echarts",
};

module.exports = {
  publicPath: "./",
  outputDir: "../docs",
  devServer: {
    port: 8999, //  端口号的配置
    open: true, // 自动打开浏览器
  },
  lintOnSave: false, // 关闭 eslint 校验
  chainWebpack(config) {
    if (IS_PRODUCTION) {
      config.plugin("html").tap((args) => {
        args[0].cdn = cdn;
        return args;
      });
      //视为一个外部库，而不将它打包进来
      config.externals(externals);
    }
  },
};
