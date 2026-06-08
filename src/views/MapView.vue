<template>
  <div class="map-view">
    <div class="map-header">
      <h2>📍 选择小区</h2>
      <p class="map-subtitle">点击地图上的标记，查看小区和户型信息</p>
    </div>
    
    <div class="map-container" ref="mapRef">
      <!-- 模拟地图背景 -->
      <div class="map-bg">
        <div class="map-grid"></div>
        <!-- 道路 -->
        <div class="road road-h1"></div>
        <div class="road road-h2"></div>
        <div class="road road-v1"></div>
        <div class="road road-v2"></div>
        <div class="road road-v3"></div>
        
        <!-- 绿地 -->
        <div class="green-zone green-1"></div>
        <div class="green-zone green-2"></div>
        
        <!-- 小区标记点 -->
        <div
          v-for="comm in communities"
          :key="comm.id"
          class="map-marker"
          :style="{ left: getMarkerPosition(comm).left, top: getMarkerPosition(comm).top }"
          @click="selectCommunity(comm)"
        >
          <div class="marker-pin">🏘️</div>
          <div class="marker-label">{{ comm.name }}</div>
        </div>
      </div>
    </div>
    
    <!-- 小区信息卡片 -->
    <div v-if="selectedCommunity" class="community-popup" @click.stop>
      <div class="popup-header">
        <h3>{{ selectedCommunity.name }}</h3>
        <button class="close-btn" @click="selectedCommunity = null">×</button>
      </div>
      <div class="popup-body">
        <p class="popup-address">📍 {{ selectedCommunity.address }}</p>
        <p class="popup-price">💰 均价：{{ selectedCommunity.avgPrice }}</p>
        <p class="popup-desc">{{ selectedCommunity.description }}</p>
        <div class="popup-features">
          <span class="tag">{{ selectedCommunity.floorPlanIds.length }} 个户型</span>
        </div>
        <button class="view-btn" @click="goToCommunity">
          查看详情 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { communities } from '../data/mock'

const router = useRouter()
const mapRef = ref(null)
const selectedCommunity = ref(null)

function getMarkerPosition(comm) {
  // 根据小区ID计算标记位置（百分比，在地图范围内）
  const positions = {
    c1: { left: '30%', top: '35%' },
    c2: { left: '60%', top: '25%' },
    c3: { left: '35%', top: '65%' },
    c4: { left: '70%', top: '60%' }
  }
  return positions[comm.id] || { left: '50%', top: '50%' }
}

function selectCommunity(comm) {
  selectedCommunity.value = comm
}

async function goToCommunity() {
  if (selectedCommunity.value) {
    await router.push({ name: 'community', params: { id: selectedCommunity.value.id } })
    selectedCommunity.value = null
  }
}
</script>

<style scoped>
.map-view {
  padding: 0;
}

.map-header {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.map-header h2 {
  margin: 0 0 8px;
  color: #2d3748;
}

.map-subtitle {
  margin: 0;
  color: #718096;
}

.map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 400px;
  overflow: hidden;
  background: #e8f4f8;
}

.map-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(100,160,200,0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100,160,200,0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}

.road {
  position: absolute;
  background: #d4dce6;
}

.road-h1 { left: 15%; right: 15%; top: 30%; height: 8px; }
.road-h2 { left: 10%; right: 10%; top: 65%; height: 8px; }
.road-v1 { top: 10%; bottom: 10%; left: 40%; width: 8px; }
.road-v2 { top: 5%; bottom: 5%; left: 65%; width: 8px; }
.road-v3 { top: 15%; bottom: 15%; left: 85%; width: 8px; }

.green-zone {
  position: absolute;
  background: #a8e6a3;
  border-radius: 50%;
  opacity: 0.5;
}

.green-1 { width: 120px; height: 120px; left: 12%; top: 15%; }
.green-2 { width: 150px; height: 100px; right: 15%; bottom: 20%; }

.map-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}

.map-marker:hover {
  transform: translate(-50%, -100%) scale(1.15);
  z-index: 20;
}

.marker-pin {
  font-size: 2em;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.marker-label {
  text-align: center;
  font-size: 0.85em;
  font-weight: bold;
  color: #2d3748;
  background: rgba(255,255,255,0.9);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  margin-top: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.community-popup {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  min-width: 320px;
  max-width: 420px;
  z-index: 50;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.popup-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #a0aec0;
  padding: 0 4px;
}

.close-btn:hover {
  color: #e53e3e;
}

.popup-address {
  margin: 4px 0;
  color: #718096;
}

.popup-price {
  margin: 4px 0;
  font-weight: bold;
  color: #e53e3e;
  font-size: 1.1em;
}

.popup-desc {
  margin: 8px 0;
  color: #4a5568;
  font-size: 0.95em;
}

.popup-features {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  background: #edf2f7;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  color: #4a5568;
}

.view-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.view-btn:hover {
  opacity: 0.9;
}
</style>
