<template>
  <div class="screen-container"
       :style="containerStyle">
    <header class="screen-header">
      <div>
        <!-- 页面顶部的边框图片 -->
        <img :src="headerSrc"
             alt="" />
      </div>
      <span class="logo">
        <img src=""
             alt="" />
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <!-- 切换主题按钮 -->
        <img :src="themeSrc"
             class="theme-switch"
             @click="changeTheme">
        <span class="datetime">{{ systemDateTime }}</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top"
             :class="{ fullscreen: fullScreenStatus.trend }">
          <!-- 销量趋势图表 -->
          <Trend ref="trend"></Trend>
          <div class="resize">
            <span @click="changeSize('trend')"
                  :class="[
              'iconfont',
              fullScreenStatus.trend
                ? 'icon-compress-alt'
                : 'icon-expand-alt',
            ]"></span>
          </div>
        </div>
        <div id="left-bottom"
             :class="{ fullscreen: fullScreenStatus.seller }">
          <!-- 商家销售金额图表 -->
          <Seller ref="seller"></Seller>
          <div class="resize">
            <span @click="changeSize('seller')"
                  :class="[
              'iconfont',
              fullScreenStatus.seller
                ? 'icon-compress-alt'
                : 'icon-expand-alt',
            ]"></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top"
             :class="{ fullscreen: fullScreenStatus.map }">
          <!-- 商家分布图表 -->
          <Map ref="map"></Map>
          <div class="resize">
            <span @click="changeSize('map')"
                  :class="[
              'iconfont',
              fullScreenStatus.map
                ? 'icon-compress-alt'
                : 'icon-expand-alt',
            ]"></span>
          </div>
        </div>
        <div id="middle-bottom"
             :class="{ fullscreen: fullScreenStatus.rank }">
          <!-- 地区销量排行图表 -->
          <Rank ref="rank"></Rank>
          <div class="resize">
            <span @click="changeSize('rank')"
                  :class="[
              'iconfont',
              fullScreenStatus.rank
                ? 'icon-compress-alt'
                : 'icon-expand-alt',
            ]"></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top"
             :class="{ fullscreen: fullScreenStatus.hot }">
          <!-- 热销商品占比图表 -->
          <Hot ref="hot"></Hot>
          <div class="resize">
            <span @click="changeSize('hot')"
                  :class="[
              'iconfont',
              fullScreenStatus.hot
                ? 'icon-compress-alt'
                : 'icon-expand-alt',
            ]"></span>
          </div>
        </div>
        <div id="right-bottom"
             :class="{ fullscreen: fullScreenStatus.stock }">
          <!-- 库存销量分析图表 -->
          <Stock ref="stock"></Stock>
          <div class="resize">
            <span @click="changeSize('stock')"
                  :class="[
              'iconfont',
              fullScreenStatus.stock
                ? 'icon-compress-alt'
                : 'icon-expand-alt',
            ]"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  components: {
    Hot,
    Map,
    Rank,
    Seller,
    Stock,
    Trend
  },
  data () {
    return {
      // 定义每一个图表的全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false
      },
      // 当前的系统时间
      systemDateTime: new Date().toLocaleString(),
      // 用于保存当前系统日期的定时器 id
      timerID: undefined
    }
  },
  computed: {
    // 页面顶部的边框图片
    headerSrc () {
      return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
    },
    // 切换主题按钮的图片路径
    themeSrc () {
      return '/static/img/' + getThemeValue(this.theme).themeSrc
    },
    // 背景颜色与标题文字颜色
    containerStyle () {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  created () {
    // 此时数据监测与代理完成，可以通过 vm 访问 data 中数据
    this.currentTime()
    // 注册服务端广播的全屏事件,完成多端联动
    this.$socket.registerCallback('fullScreen', this.recvData)
    // 注册服务端广播的主题切换事件,完成多端联动
    this.$socket.registerCallback('themeChange', this.recvThemeChange)
  },
  beforeDestroy () {
    // 组件销毁前，销毁事件
    this.$socket.unRegisterCallback('fullScreen')
    this.$socket.unRegisterCallback('themeChange')
    // 组件销毁前，取消定时器
    clearInterval(this.timerID)
  },
  methods: {
    // 改变图表尺寸
    changeSize (chartName) {
      // 1.改变 fullScreenStatus 的数据
      // this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName]
      // 2.手动调用每个图表中的 screenAdaptor 触发响应式
      // 当改变数据后，要基于更新后的新 DOM 进行某些操作时，要在 nextTick 所指定的回调函数中执行
      // this.$nextTick(() => {
      //   this.$refs[chartName].screenAdaptor()
      // })
      // 将数据发送给服务端
      const targetValue = !this.fullScreenStatus[chartName]
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName,
        value: targetValue
      })
    },
    // 接收到全屏数据之后的处理
    recvData (data) {
      // 取出是哪一个图表需要进行切换
      const chartName = data.chartName
      // 取出, 切换成什么状态
      const targetValue = data.value
      // 1.改变 fullScreenStatus 的数据
      this.fullScreenStatus[chartName] = targetValue
      // 2.手动调用每个图表中的 screenAdaptor 触发响应式
      // 当改变数据后，要基于更新后的新 DOM 进行某些操作时，要在 nextTick 所指定的回调函数中执行
      this.$nextTick(() => {
        this.$refs[chartName].screenAdaptor()
      })
    },
    changeTheme () {
      // 修改VueX中数据
      // this.$store.commit('changeTheme')
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },
    recvThemeChange () {
      this.$store.commit('changeTheme')
    },
    // 返回当前时间，每秒+1
    currentTime () {
      this.systemDateTime = new Date().toLocaleString()
      if (this.timerID) {
        clearInterval(this.timerID)
      }
      this.timerID = setInterval(() => {
        this.systemDateTime = new Date().toLocaleString()
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}

.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;

  > div {
    img {
      width: 100%;
    }
  }

  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }

  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }

  .theme-switch {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }

  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }

  // .logo {
  //   position: absolute;
  //   left: 0px;
  //   top: 50%;
  //   transform: translateY(-80%);

  //   img {
  //     height: 35px;
  //     width: 128px;
  //   }
  // }
}

.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;

  .screen-left {
    height: 100%;
    width: 27.6%;

    #left-top {
      height: 53%;
      position: relative;
    }

    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }

  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;

    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }

    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }

  .screen-right {
    height: 100%;
    width: 27.6%;

    #right-top {
      height: 46%;
      position: relative;
    }

    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}

.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
