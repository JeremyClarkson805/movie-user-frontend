import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MovieDetails from '../views/MovieDetails.vue'
import Profile from '../views/Profile.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/movie/:id',
      name: 'movie-details',
      component: MovieDetails
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      // 将 register 改为嵌套路由
      path: '/:pathMatch(.*)*',  // 匹配任意路径
      children: [
        {
          path: 'register',
          name: 'register',
          components: {
            modal: Register
          }
        },
        {
          path: 'login',
          name: 'login',
          components: {
            modal: Login
          }
        }
      ]
    },
    {
      path: '/category/:category',
      name: 'category',
      component: Home
    }
  ]
})

export default router