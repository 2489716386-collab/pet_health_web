<template>
  <el-container class="home-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo-box">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
        <span class="logo-text">宠物健康后台</span>
      </div>

      <el-menu
        :default-active="activePath"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
        unique-opened
      >
        <template v-for="item in menuList" :key="item.path">
          <el-sub-menu v-if="item.children" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="sub in item.children"
              :key="sub.path"
              :index="sub.path"
            >
              {{ sub.title }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon"><Fold /></el-icon>
          <span class="breadcrumb-title">欢迎使用宠物健康管理系统</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link avatar-box">
              <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="admin-name">超级管理员</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Setting, ChatDotRound, Fold, ArrowDown, List
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 高亮当前选中的菜单
const activePath = computed(() => route.path)

// 📌 核心：根据你的需求完美还原的菜单结构配置
const menuList = ref([
  {
    title: '用户管理',
    icon: User,
    path: '/users',
    children: [
      { title: '用户列表', path: '/users/list' },
      { title: '黑名单列表', path: '/users/blacklist' }
    ]
  },
  {
    title: '社区动态',
    icon: ChatDotRound,
    path: '/community',
    children: [
      { title: '动态内容审核', path: '/community/posts' },
      { title: '动态评论审核', path: '/community/comments' },
      { title: '举报记录中心', path: '/community/reports' }
    ]
  },
  {
    title: '系统配置',
    icon: Setting,
    path: '/system',
    children: [
      { title: '系统通知', path: '/system/notifications' },
      { title: '敏感词字典', path: '/system/sensitive-words' },
      { title: '宠物品种词典', path: '/system/breeds' },
      { title: '养护知识标准库', path: '/system/care-knowledge' },
      { title: '宠物心情记录表', path: '/system/mood-records' }
    ]
  },
  {
    title: '管理员操作日志',
    icon: List,
    path: '/logs/admin-logs' // 这里直接跳转，没有子菜单
  }
])

// 顶部下拉菜单指令处理
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 1. 清除本地存储的 Token
      localStorage.removeItem('token')
      // 2. 跳转回登录页
      router.push('/login')
      ElMessage.success('已安全退出')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  background-color: #f0f2f5;
}

/* 左侧边栏样式 */
.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 10;
}

.logo-box {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3649;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}
.el-menu-vertical {
  border-right: none;
}

/* 顶部导航栏样式 */
.header {
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
}
.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
  color: #606266;
}
.breadcrumb-title {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}
.avatar-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
}
.admin-name {
  margin-left: 10px;
  font-size: 14px;
  color: #333;
}

/* 主体内容区样式 */
.main-content {
  padding: 20px;
  box-sizing: border-box;
}

/* 页面切换动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
