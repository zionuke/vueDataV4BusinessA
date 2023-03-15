import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import echarts from 'echarts'
// 引入主题
import './assets/theme/chalk'
import './assets/theme/vintage'
// import axios from 'axios'

// 引入字体文件
import './assets/font/iconfont.css'

// 引入全局样式文件
import './assets/css/global.less'

// 引入 WebSocket
import SocketService from '@/utils/socket_service'
// 对服务端进行websocket的连接
SocketService.Instance.connect()
// 其他的组件  this.$socket
Vue.prototype.$socket = SocketService.Instance

// 请求基准路径的配置
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将 axios 挂载到 Vue 的原型对象上
// 别的组件中可通过 this.$http 访问
// Vue.prototype.$http = axios

// 把 echarts 挂载到 Vue 原型上，以便在全局访问
// 别的组件中可通过 this.$echarts 访问
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
