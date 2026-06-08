<template>
  <div id="app">
    <nav class="top-nav">
      <router-link to="/" class="nav-brand">
        🏠 3D看房工具
      </router-link>
      <div class="nav-links">
        <router-link to="/">📍 地图找房</router-link>
        <router-link to="/favorites" class="fav-link">
          ❤️ 收藏夹
          <span v-if="favCount > 0" class="fav-badge">{{ favCount }}</span>
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
import { useFavoritesStore } from './stores/favorites'

const favoritesStore = useFavoritesStore()
const favCount = computed(() => favoritesStore.favorites.length)
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: 1.4em;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 1em;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
}

.fav-link {
  position: relative;
}

.fav-badge {
  position: absolute;
  top: -8px;
  right: -16px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  min-height: calc(100vh - 56px);
}
</style>
