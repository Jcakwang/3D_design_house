<template>
  <div id="app">
    <nav class="top-nav">
      <router-link to="/" class="nav-brand">
        🏠 3D看房工具
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">📍</span>
          <span class="nav-text">地图找房</span>
        </router-link>
        <router-link to="/favorites" class="nav-item fav-link">
          <span class="nav-icon">❤️</span>
          <span class="nav-text">收藏夹</span>
          <span v-if="favCount > 0" class="fav-badge">{{ favCount }}</span>
        </router-link>
        <router-link v-if="auth.isAuthenticated" to="/admin" class="nav-item">
          <span class="nav-icon">🛠️</span>
          <span class="nav-text">管理</span>
        </router-link>
        <div v-if="auth.isAuthenticated" class="user-menu">
          <span class="user-name">{{ auth.displayName }}</span>
          <button class="logout-btn" @click="auth.logout()">退出</button>
        </div>
        <router-link v-else to="/login" class="nav-item login-link">
          <span class="nav-icon">👤</span>
          <span class="nav-text">登录</span>
        </router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useFavoritesStore } from './stores/favorites'

const auth = useAuthStore()
const favoritesStore = useFavoritesStore()
const favCount = computed(() => favoritesStore.favorites.length)
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
}

.nav-brand {
  font-size: 1.3em;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 16px;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95em;
  transition: color 0.2s;
  position: relative;
  padding: 4px 8px;
  border-radius: 6px;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.fav-badge {
  position: absolute;
  top: -2px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.65em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.user-name {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.9);
}

.logout-btn {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-family: inherit;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  min-height: calc(100vh - 56px);
}
</style>
