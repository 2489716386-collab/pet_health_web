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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
