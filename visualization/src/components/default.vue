<template>
  <div class="com-container">
    <div class="com-chart" ref="default_ref"></div>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      // echarts 实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
    };
  },
  created() {
    // created 钩子就发送请求获取数据使得图表尽早呈现
    this.getData()
  },
  mounted() {
    // 由于初始化 echarts 实例对象需要使用到 dom 元素,因此必须要放到 mounted 中, 而不是 created
    this.initChart()
    // 初次渲染图表后主动触发 响应式配置
    this.screenAdaptor()
    window.addEventListener('resize', this.screenAdaptor)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.screenAdaptor)
  },
  methods: {
    // 初始化图表的方法
    initChart() {
      // 初始化 echarts 实例对象
      this.chartInstance = this.$echarts.init(this.$refs.default_ref, "chalk");
      // 初始化的图表配置项，和数据无关
      const initOption = {};
      this.chartInstance.setOption(initOption);
    },
    // 发送请求，获取数据
    async getData() {
      const { data: ret } = await this.$http.get('default') // 获取数据
      this.updateChart() // 开始第一次渲染
    },
    // 更新图表
    updateChart(){
      // 处理数据并且更新界面图表
      // 拥有数据之后的配置项
      const dataOption = {}
      this.chartInstance.setOption(dataOption)
    },
    // 不同分辨率的响应式
    screenAdaptor(){
      const adaptOption = {}
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    }
  },
};
</script>

<style lang="less" scoped>
</style>
