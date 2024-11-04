import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MovieDetails from '../views/MovieDetails.vue'
import Profile from '../views/Profile.vue'
import SearchResults from '../views/SearchResults.vue'

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
    }
  ]
})

export default router