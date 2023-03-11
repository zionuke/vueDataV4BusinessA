<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentPage: 1, // 当前显示的页数
      totalPage: 0, // 一共有多少页
      timerId: null // 定时器的标识
    }
  },
  mounted () {
    this.initChart()
    this.getData()
  },
  beforeDestroy () {
    clearInterval(this.timerId)
  },
  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, 'chalk')
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    async getData () {
      // http://127.0.0.1:8888/api/seller
      const { data: ret } = await this.$http.get('seller')
      this.allData = ret
      // 对数据排序
      this.allData.sort((a, b) => a.value - b.value) // 从小到大的排序
      // 每5个元素显示一页
      this.totalPage = this.allData.length / 5 === 0 ? this.allData.length / 5 : Math.ceil(this.allData.length / 5)
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },
    // 更新图表
    updateChart () {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map(item => item.name)
      const sellerValues = showData.map(item => item.value)
      const option = {
        title: {
          text: '▎商家销售统计',
          textStyle: {
            fontSize: 66
          },
          left: 20,
          top: 20
        },
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
          type: 'category',
          data: sellerNames
        },
        // 柱状图条目背景
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              width: 66,
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: sellerValues,
            barWidth: 66, // 柱状图条目宽度
            // 柱状图条目文字
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 柱状图条目圆角，左上，右上，右下，左下
              barBorderRadius: [0, 33, 33, 0],
              // 指明颜色渐变的方向
              // 指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 百分之0状态之下的颜色值
                {
                  offset: 0,
                  color: '#5052EE'
                },
                // 百分之100状态之下的颜色值
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(option)
    },
    startInterval () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
