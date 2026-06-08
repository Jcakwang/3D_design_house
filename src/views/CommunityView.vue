<template>
  <div class="community-view">
    <button class="back-btn" @click="$router.push('/')">← 返回地图</button>
    
    <div v-if="community" class="community-detail">
      <div class="detail-header">
        <h2>{{ community.name }}</h2>
        <div class="detail-meta">
          <span class="price">💰 {{ community.avgPrice }}</span>
          <span>📍 {{ community.address }}</span>
        </div>
        <p class="detail-desc">{{ community.description }}</p>
      </div>
      
      <h3 class="section-title">🏠 可用户型</h3>
      
      <div class="floorplan-grid">
        <div
          v-for="fp in floorPlans"
          :key="fp.id"
          class="floorplan-card"
          @click="goToHouse(fp)"
        >
          <div class="card-visual">
            <!-- 户型示意图 -->
            <svg viewBox="0 0 200 150" class="floorplan-svg">
              <rect x="10" y="10" width="180" height="130" fill="none" stroke="#cbd5e0" stroke-width="2" rx="4"/>
              <!-- 房间分割线 -->
              <line x1="100" y1="10" x2="100" y2="140" stroke="#cbd5e0" stroke-width="1.5"/>
              <line x1="10" y1="80" x2="100" y2="80" stroke="#cbd5e0" stroke-width="1.5"/>
              <line x1="100" y1="60" x2="190" y2="60" stroke="#cbd5e0" stroke-width="1.5"/>
              <!-- 房间名称 -->
              <text x="55" y="55" text-anchor="middle" fill="#718096" font-size="11">客厅</text>
              <text x="55" y="115" text-anchor="middle" fill="#718096" font-size="11">卧室</text>
              <text x="145" y="40" text-anchor="middle" fill="#718096" font-size="11">主卧</text>
              <text x="145" y="110" text-anchor="middle" fill="#718096" font-size="11">厨房</text>
            </svg>
          </div>
          <div class="card-info">
            <h4>{{ fp.name }}</h4>
            <div class="card-tags">
              <span class="tag area">{{ fp.area }}</span>
              <span class="tag rooms">{{ fp.rooms }}</span>
            </div>
            <p class="card-desc">{{ fp.description }}</p>
            <p class="card-direction">🧭 {{ fp.direction }}</p>
            <button class="enter-btn" @click.stop="goToHouse(fp)">
              进入3D看房 →
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <p>😕 未找到该小区信息</p>
      <button class="back-btn" @click="$router.push('/')">返回地图</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { communities, floorPlans as allFloorPlans } from '../data/mock'

const route = useRoute()
const router = useRouter()

const community = computed(() =>
  communities.find(c => c.id === route.params.id)
)

const floorPlans = computed(() =>
  community.value
    ? allFloorPlans.filter(fp => community.value.floorPlanIds.includes(fp.id))
    : []
)

function goToHouse(fp) {
  router.push({
    name: 'house',
    params: { id: fp.id },
    query: { community: community.value?.name || '' }
  })
}
</script>

<style scoped>
.community-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.back-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  color: #4a5568;
  font-size: 0.95em;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.detail-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.detail-header h2 {
  margin: 0 0 8px;
  color: #2d3748;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.price {
  color: #e53e3e;
  font-weight: bold;
  font-size: 1.1em;
}

.detail-desc {
  margin: 0;
  color: #4a5568;
}

.section-title {
  color: #2d3748;
  margin: 0 0 16px;
}

.floorplan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.floorplan-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e2e8f0;
}

.floorplan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.card-visual {
  background: #f7fafc;
  padding: 16px;
  display: flex;
  justify-content: center;
}

.floorplan-svg {
  width: 100%;
  max-width: 200px;
}

.card-info {
  padding: 16px;
}

.card-info h4 {
  margin: 0 0 8px;
  color: #2d3748;
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 0.8em;
  font-weight: 500;
}

.tag.area {
  background: #ebf8ff;
  color: #2b6cb0;
}

.tag.rooms {
  background: #f0fff4;
  color: #276749;
}

.card-desc {
  margin: 0 0 4px;
  color: #718096;
  font-size: 0.9em;
}

.card-direction {
  margin: 0 0 12px;
  color: #a0aec0;
  font-size: 0.85em;
}

.enter-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.enter-btn:hover {
  opacity: 0.9;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
}
</style>
