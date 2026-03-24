import { createRouter, createWebHistory } from 'vue-router'
// 修正路径：如果页面在 src/views/ 下，就用 ../views/
import Home from '../view/Home.vue'
import About from '../view/About.vue'

import UserList from '../view/users/UserList.vue'
import Blacklist from '../view/users/Blacklist.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: '/users/list',
          name: 'UserList',
          component: UserList
        },
        {
          path: '/users/blacklist',
          name: 'Blacklist',
          component: Blacklist
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../view/Login.vue')
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
