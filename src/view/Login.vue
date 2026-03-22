<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="title">宠物健康管理后台</h2>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入管理员账号"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 引入你项目里已经配好的 axios 实例
import request from '../axios'

// 引入图标 (如果你的 main.js 没全局注册图标，需要在这里引入)
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

// 1. 表单绑定的数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 2. 表单校验规则
const rules = reactive({
  username: [
    { required: true, message: '管理员账号不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ]
})

// 3. 核心登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return

  // 先进行前端的表单校验
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 调用后端的 admin-login 接口
        const res = await request.post('/auth/admin-login', loginForm)

        // 我们后端的 Result 类返回的结构通常是 { code: 200, msg: "...", data: { token: "..." } }
        if (res.data && res.data.code === 200) {
          ElMessage.success('登录成功，欢迎回来！')

          // 从后端返回的数据中拿出 Token，并存到浏览器的 localStorage 里
          localStorage.setItem('token', res.data.data.token)

          // 登录成功后，跳转到后台首页 (你可以根据你实际的路由配置把 '/home' 换掉)
          router.push('/home')
        } else {
          // 如果密码错误等，弹出后端返回的错误信息
          ElMessage.error(res.data.msg || '登录失败，请检查账号或密码')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('网络异常，请检查后端服务是否启动')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* 页面满屏居中，加上浅蓝色背景 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #eef2f5;
}

/* 卡片样式 */
.login-card {
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  margin: 0;
  color: #303133;
  font-size: 22px;
  font-weight: bold;
}

/* 按钮撑满 */
.login-btn {
  width: 100%;
  font-size: 16px;
  margin-top: 10px;
  border-radius: 6px;
}
</style>
