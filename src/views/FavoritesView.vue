<template>
  <div class="favorites-view">
    <h2>❤️ 我的收藏</h2>
    
    <div v-if="favorites.length > 0" class="fav-list">
      <div
        v-for="fav in favorites"
        :key="fav.id"
        class="fav-card"
      >
        <div class="card-visual">
          <img :src="getFloorPlanImage(fav.id)" :alt="fav.name" class="floorplan-img" />
        </div>
        <div class="card-info">
          <h4>{{ fav.name }}</h4>
          <div class="tags">
            <span class="tag">{{ fav.area }}</span>
            <span class="tag">{{ fav.rooms }}</span>
            <span v-if="fav.communityName" class="tag community">{{ fav.communityName }}</span>
          </div>
          <div class="card-actions">
            <button class="view-btn" @click="goToHouse(fav.id)">
              🏠 进入3D看房
            </button>
            <button class="remove-btn" @click="removeFav(fav.id)">
              🗑️ 取消收藏
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">💝</div>
      <p>还没有收藏任何户型</p>
      <p class="empty-hint">去地图页面逛逛，看到喜欢的户型收藏起来吧！</p>
      <button class="go-explore" @click="$router.push('/')">
        去逛逛 🗺️
      </button>
    </div>
  </div>
</template>

<script setup>
import { useFavoritesStore } from '../stores/favorites'
import { useRouter } from 'vue-router'
import floorPlanA from '../assets/floor-plan-a.svg'
import floorPlanB from '../assets/floor-plan-b.svg'
import floorPlanC from '../assets/floor-plan-c.svg'

const favoritesStore = useFavoritesStore()
const router = useRouter()

const favorites = favoritesStore.favorites

const imageMap = { 'fp1': floorPlanA, 'fp2': floorPlanB, 'fp3': floorPlanC }

function getFloorPlanImage(id) {
  return imageMap[id] || floorPlanA
}

function removeFav(id) {
  favoritesStore.removeFavorite(id)
}

function goToHouse(id) {
  router.push({ name: 'house', params: { id } })
}
</script>

<style scoped>
.favorites-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.favorites-view h2 {
  margin: 0 0 24px;
  color: #2d3748;
}

.fav-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.fav-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.card-visual {
  background: #f7fafc;
  padding: 16px;
  display: flex;
  justify-content: center;
}

.floorplan-img {
  width: 100%;
  max-width: 280px;
  height: auto;
}

.card-info {
  padding: 16px;
}

.card-info h4 {
  margin: 0 0 8px;
  color: #2d3748;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tag {
  background: #edf2f7;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 0.8em;
  color: #4a5568;
}

.tag.community {
  background: #faf5ff;
  color: #6b46c1;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.view-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.remove-btn {
  padding: 10px 14px;
  background: none;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  cursor: pointer;
  color: #e53e3e;
}

.remove-btn:hover {
  background: #fff5f5;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 16px;
}

.empty-hint {
  color: #cbd5e0;
  margin-bottom: 20px;
}

.go-explore {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
}
</style>
