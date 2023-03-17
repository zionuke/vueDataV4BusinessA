<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  // 商家销售统计
  name: 'Seller',
  data () {
    return {
      chartInstance: null, // echarts 实例对象
      allData: null, // 服务器返回的数据
      currentPage: 1, // 当前显示的页数
      totalPage: 0, // 总页数
      timerId: null // 定时器标识
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      this.chartInstance.dispose() // 销毁当前的图表
      this.initChart() // 重新以最新的主题名称初始化图表对象
      this.screenAdaptor() // 完成屏幕的适配
      this.updateChart() // 更新图表的展示
    }
  },
  created () {
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallback('sellerData', this.getData)
  },
  mounted () {
    // 由于初始化使用到了 DOM 元素，因此需要在 mounted 生命周期钩子内调用
    this.initChart()
    // 在页面加载完成时, 主动对屏幕进行适配
    this.screenAdaptor()
    window.addEventListener('resize', this.screenAdaptor)
  },
  beforeDestroy () {
    // 在组件销毁前，取消定时器
    clearInterval(this.timerId)
    // 在组件销毁前，把事件监听器取消掉
    window.removeEventListener('resize', this.screenAdaptor)
    this.$socket.unRegisterCallback('sellerData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      // 初始化的图表配置项，和数据无关
      const initOption = {
        title: {
          text: '▎商家销售统计',
          left: 20,
          top: 20
        },
        // 坐标轴位置
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 距离包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        // 柱状图条目背景
        tooltip: {
          // 当鼠标移入 axis(坐标轴)时显示底层的背景色
          trigger: 'axis',
          axisPointer: {
            // 显示的类型是线条类型
            type: 'line',
            // 相当于 z-index 将层级调低，否则会遮盖柱状图本身
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            // 柱状图条目文字
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            // 每一个柱的样式
            itemStyle: {
              // 指明颜色渐变的方向(第四象限坐标轴)
              // 指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 0%状态之下的颜色值
                {
                  offset: 0,
                  color: '#5052EE'
                },
                // 100%状态之下的颜色值
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    getData (ret) {
      // http://127.0.0.1:8888/api/seller
      // const { data: ret } = await this.$http.get('seller')
      this.allData = ret
      // 对数据排序
      this.allData.sort((a, b) => a.value - b.value) // 从小到大的排序
      // 每5个元素显示一页，计算出总页数
      this.totalPage = this.allData.length / 5 === 0 ? this.allData.length / 5 : Math.ceil(this.allData.length / 5)
      // 开始第一次渲染
      this.updateChart()
      // 启动定时器 开始动态渲染
      this.startInterval()
    },
    // 更新图表
    updateChart () {
      // 动态从数组中取出5条数据
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      // y轴上的数据
      const sellerNames = showData.map(item => item.name)
      // x 轴上的数据
      const sellerValues = showData.map(item => item.value)
      // 获取数据之后的配置
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 开启动态渲染的定时器
    startInterval () {
      // 一般使用定时器都有一个保险操作,若已有定时器则先关闭再开启
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        // 当超出最大页数时,回到第一页
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdaptor () {
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的配置项
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        // 柱状图条目背景
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize, // 柱状图条目宽度
            itemStyle: {
              // 柱状图条目圆角，左上，右上，右下，左下
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adaptOption)
      // 手动的调用图表对象的 resize 才能产生效果(改变图表尺寸，在容器大小发生改变时需要手动调用)
      this.chartInstance.resize()
    }
  }
}
</script>

<style lang="less" scoped></style>
