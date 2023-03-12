<!--
针对于 /stockpage 这条路径而显示出来的
在这个组件中, 通过子组件注册的方式, 要显示出Stock.vue这个组件
-->
<template>
  <div class="com-page">
    <Stock></Stock>
  </div>
</template>

<script>
import Stock from '@/components/Stock'
export default {
  components: {
    Stock
  },
  data () {
    return {}
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
