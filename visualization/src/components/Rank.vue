<template>
  <div class='com-container'>
    <div class='com-chart' ref='rank_ref'></div>
  </div>
</template>

<script>
export default {
  // 地区销量排行
  name: 'Rank',
  data () {
    return {
      chartInstance: null, // echarts 实例对象
      allData: null, // 从服务器中获取的所有数据
      startValue: 0, // 柱状图区域缩放起点值
      endValue: 9, // 柱状图区域缩放终点值
      timerId: null // 定时器标识
    }
  },
  computed: {},
  mounted () {
    this.initChart()
    this.getData()
    // 初次渲染图表后主动触发 响应式配置
    this.screenAdaptor()
    window.addEventListener('resize', this.screenAdaptor)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdaptor)
    clearInterval(this.timerId)
  },
  methods: {
    // 初始化图表的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, 'chalk')
      const initOption = {
        title: {
          text: '▎ 地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true // 距离包含坐标轴上的文字
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 鼠标悬停在柱状图区域关闭动画效果
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      // 鼠标离开柱状图区域开启动画效果
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 发送请求，获取数据
    async getData () {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      const { data: ret } = await this.$http.get('rank')
      this.allData = ret
      // 对数据进行排序(从大到小)
      this.allData.sort((a, b) => b.value - a.value)
      this.updateChart()
      // 获取数据初次渲染后开启动画
      this.startInterval()
    },
    // 更新图表配置项
    updateChart () {
      // 渐变色数组
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      // 处理图表需要的数据
      // 所有省份所形成的数组(x轴)
      const provinceArr = this.allData.map(item => item.name)
      // 所有省份对应的销售金额(y轴)
      const valueArr = this.allData.map(item => item.value)
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        // 区域缩放组件
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: {
          data: valueArr,
          itemStyle: {
            color: (e) => {
              let targetColorArr
              if (e.value > 300) {
                targetColorArr = colorArr[0]
              } else if (e.value > 200) {
                targetColorArr = colorArr[1]
              } else {
                targetColorArr = colorArr[2]
              }
              return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: targetColorArr[0]
                },
                {
                  offset: 1,
                  color: targetColorArr[1]
                }
              ])
            }
          }
        }
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    // 根据图标容器的宽度 计算各属性、标签、元素的大小
    screenAdaptor () {
      // 测试算出来的合适的字体大小
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0] // 柱状图圆角依次为左上，右上，右下，左下
            }
          }
        ]
      }
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    },
    // 通过定时器动态改变柱状图区域缩放起始与终点值形成动画
    startInterval () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style lang='less' scoped></style>
