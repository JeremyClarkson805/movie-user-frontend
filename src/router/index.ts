import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MovieDetails from '../views/MovieDetails.vue'
import Profile from '../views/Profile.vue'
import SearchResults from '../views/SearchResults.vue'
import MembershipPlans from '../views/MembershipPlans.vue'
import Subscribe from '../views/Subscribe.vue'
import NotFound from '../views/NotFound.vue'
import ForgotPassword from '../views/ForgotPassword.vue'

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
      path: '/category/:category',
      name: 'category',
      component: Home
    },
    {
      path: '/search',
      name: 'search',
      component: SearchResults
    },
    {
      path: '/membership',
      name: 'membership',
      component: MembershipPlans
    },
    {
      path: '/subscribe/:plan',
      name: 'subscribe',
      component: Subscribe
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

export default router