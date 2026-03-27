import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
// 导入你封装的 axios 实例（注意路径是否正确）
import request from '@/axios'
const debounce = (fn, delay) => {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

const _ResizeObserver = window.ResizeObserver
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor (callback) {
    callback = debounce(callback, 16)
    super(callback)
  }
}

// 创建 Vue 3 应用实例
const app = createApp(App)

// 安装插件
app.use(router)
app.use(ElementPlus)

// ===== 关键修复：Vue 3 挂载全局属性的正确方式 =====
// 替代 Vue 2 的 Vue.prototype.$axios
app.config.globalProperties.$axios = request

// 挂载应用到 DOM
app.mount('#app')
