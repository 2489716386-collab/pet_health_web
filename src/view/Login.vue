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
import request from '../axios'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    { required: true, message: '管理员账号不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await request.post('/auth/admin-login', loginForm)

        // 【破案核心】拦截器放行后，res 就是后端返回的对象，直接判断 code 是否为 1
        if (res && (res.code === 200 || res.code === 1 || res.msg === 'success')) {
          localStorage.setItem('token', res.data)
          localStorage.setItem('username', loginForm.username)
          ElMessage.success('登录成功，欢迎回来！')

          // 【破案核心】后端 data 直接就是 token 字符串
          localStorage.setItem('token', res.data.token)

          // 【破案核心】根据你 router/index.js 的配置，首页路径是 '/'
          router.push('/')
        } else {
          ElMessage.error(res.msg || '登录失败，请检查账号或密码')
        }
      } catch (error) {
        console.error('登录异常:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  background-image: url('https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAER-uBpv7WqhIi4RhN0mWkvFKQTMLcteAACVh8AAiLe-FXuWoRfZ6aB3joE.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-container::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.1); /* 浅浅的黑色遮罩 */
  z-index: 1;
}
.login-card {
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2); /* 加深阴影，增加浮动感 */
  z-index: 2; /* 确保卡片在遮罩层之上 */
}
.login-card-transparent {
  /* 👇 去除默认白色背景，设置半透明白色背景 (RGBA最后的0.8代表80%透明) 👇 */
  background-color: rgba(255, 255, 255, 0.8) !important;

  /* 👇 加上这一行，瞬间提升高级感：高斯模糊（毛玻璃效果） 👇 */
  backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.3); /* 增加一点亮边 */
}

.title {
  text-align: center;
  margin: 0;
  color: #303133;
  font-size: 22px;
  font-weight: bold;
}
.login-btn {
  width: 100%;
  font-size: 16px;
  margin-top: 10px;
  border-radius: 6px;
}
</style>
