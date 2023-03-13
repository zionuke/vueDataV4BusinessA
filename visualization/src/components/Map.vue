<template>
  <div class='com-container' @dblclick="chinaMap">
    <div class='com-chart' ref='map_ref'></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'

export default {
  // 商家分布模块
  name: 'Map',
  data () {
    return {
      chartInstance: null, // echarts 实例对象
      allData: null, // 服务器返回的散点图数据
      provinceMapData: {} // 获取的省份矢量地图数据的缓存
    }
  },
  computed: {},
  created () {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallback('mapData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    // 初次渲染图表后主动触发 响应式配置
    this.screenAdaptor()
    window.addEventListener('resize', this.screenAdaptor)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdaptor)
    this.$socket.unRegisterCallback('mapData')
  },
  methods: {
    // 初始化图表的方法
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, 'chalk')
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于我们现在获取的地图矢量数据并不是位于 KOA2 的后台, 所以咱们不能使用 this.$http，本地直接 import() 动态导入即可
      const china = await import('../../public/static/map/china.json')
      // JSON 内容是模块的默认导出，因此通过 default 获取内容
      // 注册地图数据
      this.$echarts.registerMap('china', china.default)
      const initOption = {
        title: {
          text: '▎ 商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E72BF', // 地图的填充色
            borderColor: '#333' // 省份的边框色
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      // 省份地图点击事件处理函数
      this.chartInstance.on('click', async e => {
        // e.name 得到所点击的省份, 这个省份名是中文
        // 通过工具函数拿到点击的地图对应的中文拼音(key),和拼接出需要的文件路径(path)
        const provinceInfo = getProvinceMapInfo(e.name)

        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据是否已经存在
        if (!this.provinceMapData[provinceInfo.key]) {
          // 不存在： 发送请求,获取点击的地图的矢量数据
          // 为什么这里不能import()+相对路径动态import const ret = await import(provinceInfo.path)
          const ret = await axios.get('http://localhost:8999' + provinceInfo.path)
          // 把请求得到的数据缓存下来
          this.provinceMapData[provinceInfo.key] = ret.data
          // 注册点击的地图
          this.$echarts.registerMap(provinceInfo.key, ret.data)
        }
        // 设置单击所得省份的配置项
        const provinceOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(provinceOption)
      })
    },
    // 发送请求，获取数据
    getData (ret) {
      // 获取服务器的数据, 对 this.allData 进行赋值之后, 调用 updateChart 方法更新图表
      // const { data: ret } = await this.$http.get('map')
      this.allData = ret
      this.updateChart()
    },
    // 更新图表配置项
    updateChart () {
      // 处理图表需要的数据
      // 图例的数据
      const legendArr = this.allData.map(item => item.name)
      // 散点图的数据
      const seriesArr = this.allData.map(item => ({
        // 返回的一个对象代表一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        type: 'effectScatter',
        // 涟漪动画效果配置
        rippleEffect: {
          // 涟漪效果直径
          scale: 5,
          // 空心的涟漪动画效果
          brushType: 'stroke'
        },
        // 图例的name需要与series的name相同
        name: item.name,
        data: item.children,
        // 让散点图使用地图坐标系统
        coordinateSystem: 'geo'
      }))
      const dataOption = {
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
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          // 图例宽度
          itemWidth: titleFontSize / 2,
          // 图例高度
          itemHeight: titleFontSize / 2,
          // 图例间隔
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adaptOption)
      this.chartInstance.resize()
    },
    // 回到中国地图
    chinaMap () {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>

<style lang='less' scoped>
</style>
