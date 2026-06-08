import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import CommunityView from '../views/CommunityView.vue'
import HouseView from '../views/HouseView.vue'
import FavoritesView from '../views/FavoritesView.vue'

const routes = [
  { path: '/', name: 'map', component: MapView },
  { path: '/community/:id', name: 'community', component: CommunityView },
  { path: '/house/:id', name: 'house', component: HouseView },
  { path: '/favorites', name: 'favorites', component: FavoritesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
