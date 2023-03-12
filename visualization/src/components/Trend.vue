<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>▎{{showTitle}}</span>
      <span class="iconfont title-icon" :style="comStyle" @click="showChoice = !showChoice">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{item.text}}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
export default {
  // 销量趋势图表
  name: 'Trend',
  data () {
    return {
      chartInstance: null, // 图表的实例对象
      allData: null, // 从服务器中获取的所有数据
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 显示的数据类型
      titleFontSize: 0 // 指明标题的字体大小
    }
  },
  computed: {
    // 点击过后需要显示的数组
    selectTypes () {
      if (!this.allData) {
        return []
      } else {
        // 过滤掉当前显示的数据类型
        return this.allData.type.filter(item => item.key !== this.choiceType)
      }
    },
    // 当前显示的标题
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    // 设置给标题的样式
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    // 将可选项与当前显示标题纵向对齐
    marginStyle () {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    }
  },
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
      const initOption = {
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true // 距离包含坐标轴上的文字
        },
        xAxis: {
          type: 'category',
          boundaryGap: false // 紧挨边缘
        },
        yAxis: {
          type: 'value'
        },
        // 工具提示
        tooltip: {
          trigger: 'axis' // 当鼠标移入坐标轴时显示提示
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle' // 图例的 icon 类型
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    async getData () {
      // ret 就是服务端发送给客户端的图表的数据，解构赋值
      const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      this.updateChart()
    },
    // 更新图表配置项
    updateChart () {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]

      // 处理数据
      // 类目轴的数据(x轴)
      const timeArr = this.allData.common.month
      // y轴的数据 series下的数据
      const valueArr = this.allData[this.choiceType].data
      // 加括号的函数体返回对象字面量表达式
      const seriesArr = valueArr.map((item, index) => ({
        // 图例的数据需要和 series 的 name 匹配
        name: item.name,
        type: 'line',
        data: item.data,
        // 同个类目轴上系列配置相同的stack值后，后一个系列的值会在前一个系列的值上相加(堆叠图)
        stack: this.choiceType,
        // 区域填充样式
        areaStyle: {
          color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              // 0% 颜色
              offset: 0,
              color: colorArr1[index]
            },
            {
              // 100% 颜色
              offset: 1,
              color: colorArr2[index]
            }
          ])
        }
      }))
      // 图例的数据
      const legendArr = valueArr.map(item => item.name)
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    screenAdaptor () {
      // 测试算出来的合适的字体大小
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adaptOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize, // 间距
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    },
    // 数据类型点击回调函数
    handleSelect (currentType) {
      this.choiceType = currentType
      this.updateChart()
      this.showChoice = false
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con {
    background-color: #222733;
  }
}
</style>
