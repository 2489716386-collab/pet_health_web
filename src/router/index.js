import { createRouter, createWebHistory } from 'vue-router'
// 修正路径：如果页面在 src/views/ 下，就用 ../views/
import Home from '../view/Home.vue'
import About from '../view/About.vue'

import UserList from '../view/users/UserList.vue'
import Blacklist from '../view/users/Blacklist.vue'
import AdminLogs from '../view/logs/AdminLogs.vue'
import CommunityPosts from '../view/community/CommunityPosts.vue'
import Comments from '../view/community/Comments.vue'
import Reports from '../view/community/Reports.vue'
import Notifications from '../view/system/Notifications.vue'
import SensitiveWords from '../view/system/SensitiveWords.vue'
import PetBreeds from '../view/system/PetBreeds.vue'
import Dashboard from '../view/Dashboard.vue'
import Login from '@/view/Login.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    {
      path: '/home',
      name: 'home',
      component: Home,
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: { title: '工作台首页' }
        },
        {
          path: '/users/list',
          name: 'UserList',
          component: UserList
        },
        {
          path: '/users/blacklist',
          name: 'Blacklist',
          component: Blacklist
        },
        {
          path: '/logs/admin-logs',
          name: 'AdminLogs',
          component: AdminLogs
        },
        {
          path: '/community/posts',
          name: 'CommunityPosts',
          component: CommunityPosts
        },
        {
          path: '/community/comments',
          name: 'Comments',
          component: Comments
        },
        {
          path: '/community/reports',
          name: 'Reports',
          component: Reports
        },
        {
          path: '/system/notifications',
          name: 'Notifications',
          component: Notifications
        },
        {
          path: '/system/sensitive-words',
          name: 'SensitiveWords',
          component: SensitiveWords
        },
        {
          path: '/system/pet-breeds',
          name: 'PetBreeds',
          component: PetBreeds
        }
      ]
    },
    {
      path: '/system/knowledge',
      name: 'CareKnowledgeBase',
      component: () => import('@/view/system/CareKnowledgeBase.vue'),
      meta: { title: '养护知识库' }
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

// --- 添加以下路由拦截逻辑 ---
router.beforeEach((to, from, next) => {
  // 1. 获取本地存储的 token
  const token = localStorage.getItem('token')

  // 2. 判断是否去往登录页
  if (to.path === '/login') {
    next() // 如果去登录页，直接放行
  } else {
    // 3. 如果去往其他页面，检查是否有 token
    if (!token) {
      // 没有 token，强制跳转到登录页
      next('/login')
    } else {
      // 有 token，放行
      next()
    }
  }
})

export default router
