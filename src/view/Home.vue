<template>
  <h1>首页</h1>
  <el-button type="primary">我是首页按钮</el-button>
  <!-- 如果你要使用 helloWorld 组件，就添加这个标签；不用就删掉组件注册 -->
  <!-- <hello-world /> -->
</template>

<script>
// 如果你不用 helloWorld 组件，直接删掉这行导入
// import helloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    // ===== 修复1：删除未使用的组件注册 =====
    // helloWorld // 删掉这行，解决“组件未使用”报错
  },
  created () {
    // ===== 修复2：修正 axios get 请求写法 + 补全 res 参数 =====
    this.$axios.get('/admin-logs/page', {
      // get 请求的参数必须放在 params 里（核心！否则后端收不到参数）
      params: {
        pageNum: 1,
        pageSize: 2
      }
    }).then((res) => { // 补全 (res) 参数，解决 res 未定义报错
      console.log(res) // 现在 res 有定义了
    }).catch((err) => { // 建议添加错误捕获，避免请求失败报错
      console.error('请求失败：', err)
    })
  }
}
</script>
