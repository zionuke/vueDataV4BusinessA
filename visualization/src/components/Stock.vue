<template>
  <div class='com-container'>
    <div class='com-chart' ref='stock_ref'></div>
  </div>
</template>

<script>
export default {
  name: 'Stock',
  data () {
    return {}
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
  },
  methods: {
    // 初始化图表的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, 'chalk')
      const initOption = {}
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    async getData () {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      this.updateChart()
    },
    // 更新图表配置项
    updateChart () {
      const dataOption = {}
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    screenAdaptor () {
      // 测试算出来的合适的字体大小
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6
      const adaptOption = {}
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    }
  }
}
</script>

<style lang='less' scoped></style>
