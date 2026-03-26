<template>
  <el-container style="height: 100vh;">
    <el-aside width="230px" class="aside">
      <div class="logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" v-if="false" /> <h2>宠健后台管理</h2>
      </div>

      <el-menu
        :default-active="$route.path"
        router
        class="el-menu-vertical"
        background-color="#2b333e"
        text-color="#b0b7c0"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon><span>工作台首页</span>
        </el-menu-item>

        <el-menu-item-group title="用户管理">
          <el-menu-item index="/users/list"><el-icon><User /></el-icon><span>用户列表</span></el-menu-item>
          <el-menu-item index="/users/blacklist"><el-icon><Lock /></el-icon><span>黑名单管控</span></el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group title="社区管理">
          <el-menu-item index="/community/posts"><el-icon><Document /></el-icon><span>社区动态</span></el-menu-item>
          <el-menu-item index="/community/comments"><el-icon><ChatLineRound /></el-icon><span>评论管理</span></el-menu-item>
          <el-menu-item index="/community/reports"><el-icon><Warning /></el-icon><span>举报处理</span></el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group title="系统配置">
          <el-menu-item index="/system/notifications"><el-icon><Bell /></el-icon><span>系统通知</span></el-menu-item>
          <el-menu-item index="/system/sensitive-words"><el-icon><Mute /></el-icon><span>敏感词字典</span></el-menu-item>
          <el-menu-item index="/system/pet-breeds"><el-icon><Operation /></el-icon><span>宠物品种字典</span></el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group title="日志管理">
          <el-menu-item index="/logs/admin-logs"><el-icon><Reading /></el-icon><span>操作日志</span></el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.path !== '/dashboard'">{{ $route.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" style="margin-right: 10px;" />
          <span class="user-info">超级管理员 ({{ username }})</span>
          <el-divider direction="vertical" />
          <el-button type="danger" size="small" @click="handleLogout" plain>退出登录</el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { House, User, Lock, Document, ChatLineRound, Warning, Bell, Mute, Operation, Reading } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
// 从本地存储获取登录时保存的管理员用户名
const username = ref(localStorage.getItem('username') || 'admin')

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' }).then(() => {
    localStorage.removeItem('token')
    // 可选：清除存的用户名 localStorage.removeItem('username')
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.aside { background-color: #2b333e; transition: width 0.3s; display: flex; flex-direction: column; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; background-color: #202731; display: flex; align-items: center; justify-content: center; }
.logo h2 { margin: 0; font-size: 18px; letter-spacing: 1px; }
.el-menu-vertical { border-right: none; flex: 1; overflow-y: auto; }

/* 美化分组标题 */
:deep(.el-menu-item-group__title) { padding: 15px 20px 5px !important; font-size: 12px; color: #6b7a90; font-weight: bold; letter-spacing: 1px; }
.el-menu-item { height: 45px; line-height: 45px; border-radius: 4px; margin: 4px 10px; width: calc(100% - 20px); }
.el-menu-item.is-active { background-color: #409EFF !important; color: #fff !important; }

.header { background-color: #fff; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,21,41,.08); padding: 0 20px; z-index: 10; }
.header-right { display: flex; align-items: center; }
.user-info { font-size: 14px; color: #606266; font-weight: 500; }
.main-content { background-color: #f0f2f5; padding: 0; } /* Padding 在子页面里控制 */
</style>
