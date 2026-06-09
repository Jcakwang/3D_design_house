import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import CommunityView from '../views/CommunityView.vue'
import HouseView from '../views/HouseView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'
import NotFound from '../views/NotFound.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'map', component: MapView },
  { path: '/community/:id', name: 'community', component: CommunityView },
  { path: '/house/:id', name: 'house', component: HouseView },
  { path: '/favorites', name: 'favorites', component: FavoritesView, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  const titleMap = {
    map: '地图找房 - 3D看房工具',
    community: '小区详情 - 3D看房工具',
    house: '3D看房 - 3D看房工具',
    favorites: '我的收藏 - 3D看房工具',
    login: '登录 - 3D看房工具',
    admin: '后台管理 - 3D看房工具',
    not_found: '页面未找到'
  }
  document.title = titleMap[to.name] || '3D看房工具'
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: 'login' })
  } else {
    if (to.name === 'login' && auth.isAuthenticated) {
      next({ name: 'map' })
    } else {
      next()
    }
  }
})

export default router
