<template>
  <div class='com-container'>
    <div class='com-chart' ref='stock_ref'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  // 库存和销量展示
  name: 'Stock',
  data () {
    return {
      chartInstance: null, // echarts 实例对象
      allData: null, // 服务器返回的数据
      currentIndex: 0, // 当前显示数据的页数
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
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallback('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    // 初次渲染图表后主动触发 响应式配置
    this.screenAdaptor()
    window.addEventListener('resize', this.screenAdaptor)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdaptor)
    clearInterval(this.timerId)
    this.$socket.unRegisterCallback('stockData')
  },
  methods: {
    // 初始化图表的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      const initOption = {
        title: {
          text: '▎库存和销量分析',
          left: 20,
          top: 20
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 发送请求，获取数据
    getData (ret) {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get('stock')
      this.allData = ret
      // 开始第一次渲染
      this.updateChart()
      // 启动定时器 开始动态渲染
      this.startInterval()
    },
    // 更新图表配置项
    updateChart () {
      // 圆环圆心坐标
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      // 圆环渐变色
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      // 处理图表需要的数据
      // 10个数据5个一页分为2组
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => ({
        type: 'pie',
        // 设置成圆环图，外圆半径，内圆半径 在响应式处指定
        // radius: [110, 100], 不用在这设置，screenAdaptor中已设置
        center: centerArr[index], // 圆环圆心坐标
        hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
        labelLine: {
          show: false // 隐藏指示线
        },
        // 圆环内文字的显示
        label: {
          position: 'center',
          color: colorArr[index][0]
        },
        data: [
          // 销量
          {
            name: item.name + '\n' + item.sales, // 圆环内文字的显示
            value: item.sales,
            itemStyle: {
              // 创建线性渐变的颜色 从下往上
              color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: colorArr[index][0]
                },
                {
                  offset: 1,
                  color: colorArr[index][1]
                }
              ])
            },
            // 内部的提示框
            tooltip: {
              // 提示框浮层内容格式器，支持字符串模板和回调函数两种形式
              // 字符串模板模板变量有 {a}, {b}，{c}，{d}，{e}，饼图中 {c}数值 {d}百分比
              formatter: `${item.name} <br>销量：{c} <br>占比：{d}%`
            }
          },
          // 库存
          {
            value: item.stock,
            itemStyle: {
              color: '#333843'
            },
            // 内部的提示框
            tooltip: {
              formatter: `${item.name} <br>库存：{c} <br>占比：{d}%`
            }
          }
        ]
      }))
      const dataOption = {
        tooltip: {
          // 触发类型,这里为 item 可以为内部的数据开启单独的 tooltip
          trigger: 'item'
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    screenAdaptor () {
      // 测试算出来的合适的字体大小
      const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6
      // 圆环的内圆半径和外圆半径
      const innerRadius = titleFontSize * 2.8
      const outerRadius = innerRadius * 1.125
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2
            }
          }
        ]
      }
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    },
    // 定时器不断切换当前页数
    startInterval () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart() // 在更改完currentIndex之后 , 需要更新界面
      }, 5000)
    }
  }
}
</script>

<style lang='less' scoped></style>
