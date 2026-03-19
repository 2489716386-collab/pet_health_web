import { createRouter, createWebHistory } from 'vue-router'
// 修正路径：如果页面在 src/views/ 下，就用 ../views/
import Home from '../view/Home.vue'
import About from '../view/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

export default router
