// 只保留必要的 axios 导入，删除误导入的 config
import axios from 'axios'
// 2. 补充导入 ElMessage（Element Plus 消息组件）
import { ElMessage } from 'element-plus'

// 3. 补充导入路由实例（关键！路径要和你项目的 router 文件夹一致）
import router from '@/router' // 如果 router 文件夹在 src 根目录，这个路径就对
// 如果路径不对，改成：import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080', // 【修改点1】将 baseURL 移到实例配置中
  timeout: 5000,
  headers: {}
})

// 请求拦截器：给请求头添加 token
// 注意：参数名用 configInstance 避免命名歧义（也可以仍用 config，只要删除顶部误导入的 config 即可）
request.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token 并添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  // 补充拦截器的错误处理分支（axios 规范写法）
  (error) => {
    console.error('请求拦截器错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器：处理响应和错误
// request.interceptors.response.use(
//   (response) => {
//     console.log('响应数据：', response)
//     return response
//   },
//   (error) => {
//     console.error('响应拦截器错误：', error)
//     return Promise.reject(error)
//   }
// )

request.interceptors.response.use(
  // 成功回调（修复拼写错误）
  (response) => {
    // 这里直接拿到了后端的 Result 对象 (包含 code, msg, data)
    const res = response.data
    // 成功状态码
    if (res.code === 200 || res.code === 1 || res.msg === 'success') {
      return res
    }
    // 未登录/权限不足,(根据你后端的实际未登录状态码调整，常见的是 401)
    if (res.code === 302 || res.code === 401) {
      ElMessage.error(res.msg || '登录已过期，请重新登录')
      localStorage.removeItem('token')// 清除失效的 token
      // 跳转到登录页（修正路径）
      router.push('/login')
      return Promise.reject(res.msg)
    }
    ElMessage.error(res.msg || '系统异常，请联系管理员')
    return Promise.reject(res.msg)
  },
  // 失败回调（补充网络错误处理）
  (error) => {
    ElMessage.error('网络异常，请检查后端服务是否启动')
    return Promise.reject(error)
  }
)

// 导出 axios 实例
export default request
