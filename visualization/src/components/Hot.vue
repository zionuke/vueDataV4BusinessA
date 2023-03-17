<template>
  <div class='com-container'>
    <div class='com-chart' ref='hot_ref'></div>
    <span class="iconfont icon-left" @click="toLeft" :style="iconStyle">&#xe6ef;</span>
    <span class="iconfont icon-right" @click="toRight" :style="iconStyle">&#xe6ed;</span>
    <span class="cat-name" :style="iconStyle">{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  // 热销商品占比
  name: 'Hot',
  data () {
    return {
      chartInstance: null, // echarts 实例对象
      allData: null, // 从服务器中获取的所有数据
      currentIndex: 0, // 当前显示的一级分类数据对应的索引
      titleFontSize: 0 // 字体响应式大小
    }
  },
  computed: {
    // 当前显示的一级分类数据名称
    catName () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    // 左右箭头和标题 css
    iconStyle () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
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
      socketType: 'hotData',
      chartName: 'hot',
      value: ''
    })
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallback('hotData', this.getData)
  },
  mounted () {
    this.initChart()
    // 初次渲染图表后主动触发 响应式配置
    this.screenAdaptor()
    window.addEventListener('resize', this.screenAdaptor)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdaptor)
    this.$socket.unRegisterCallback('hotData')
  },
  methods: {
    // 初始化图表的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        title: {
          text: '▎热销商品占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle' // 图标类型 圆形
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            // 高亮状态下的样式
            emphasis: {
              label: {
                show: true,
                formatter: '{b}:{d}%'
              },
              // 连接文字的线条
              labelLine: {
                show: false
              }
            }
          }
        ],
        tooltip: {
          show: true,
          formatter: (e) => {
            // 拿到三级分类的数据
            const thirdCategory = e.data.children
            // 计算所有三级分类的数值总和，才能计算出百分比
            const total = thirdCategory.reduce((pre, cur) => pre + cur.value, 0)
            // 显示的文本
            let retStr = ''
            thirdCategory.forEach((item) => {
              // 为啥模板字符串内换行不起作用
              retStr += `${item.name}:${(item.value / total * 100).toFixed(2)}%
              <br>
              `
            })
            return retStr
          }
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    getData (ret) {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get('hot')
      this.allData = ret
      this.updateChart()
    },
    // 更新图表配置项
    updateChart () {
      // 处理图表需要的数据
      const legendData = this.allData[this.currentIndex].children.map(item => item.name)
      const seriesData = this.allData[this.currentIndex].children.map(item => ({
        name: item.name,
        value: item.value,
        children: item.children // 新增加children的原因是为了在tooltip中的formatter的回调函数中,来拿到这个二级分类下的三级分类数据
      }))
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    screenAdaptor () {
      // 测试算出来的合适的字体大小
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.8, // 饼图的半径
            center: ['50%', '60%'] // 饼图圆心的位置 x,y(第四象限)
          }
        ]
      }
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    },
    // 点击左侧按钮
    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    // 点击右侧按钮
    toRight () {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style lang='less' scoped>
.icon-left {
  position: absolute;
  left: 10%;
  top: 60%;
  transform: translateY(-50%);
  cursor: pointer;
}
.icon-right {
  position: absolute;
  right: 10%;
  top: 60%;
  transform: translateY(-50%);
  cursor: pointer;
}
.cat-name {
  position:absolute;
  left: 80%;
  bottom: 20px;
}
</style>
