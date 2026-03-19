import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 1. 确保正确导入 router
import router from './router'

const app = createApp(App)

// 2. 必须添加这一行，真正启用路由
app.use(router)

// 3. 安装 Element Plus
app.use(ElementPlus)

// 4. 挂载
app.mount('#app')
