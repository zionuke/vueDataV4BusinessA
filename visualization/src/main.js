import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入全局的样式文件
import './assets/css/global.less'

// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将 axios 挂载到 Vue 的原型对象上
// 别的组件中可通过 this.$http 访问
Vue.prototype.$http = axios

// 将全局的 echarts 对象挂载到 Vue 的原型对象上
// 别的组件中可通过 this.$echarts 访问
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')