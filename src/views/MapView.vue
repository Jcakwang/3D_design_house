<template>
  <div class="map-view">
    <div class="map-header">
      <h2>📍 选择小区</h2>
      <p class="map-subtitle">点击地图上的标记，查看小区和户型信息</p>
    </div>

    <div class="map-container" ref="mapRef">
      <div id="amap-container" :class="{ 'map-loading': !mapLoaded }">
        <div v-if="!mapLoaded" class="loading-overlay">
          <div class="spinner"></div>
          <p>地图加载中...</p>
        </div>
        <div v-if="mapError" class="map-error">
          <p>😔 地图加载失败</p>
          <button @click="retryLoad">重新加载</button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { communities } from '../data/mock'

const router = useRouter()
const mapRef = ref(null)
const selectedCommunity = ref(null)
const mapLoaded = ref(false)
const mapError = ref(false)

let mapInstance = null
let markers = []

function initMap() {
  if (mapInstance) return

  try {
    mapInstance = new AMap.Map('amap-container', {
      zoom: 12,
      center: [116.4074, 39.9042],
      mapStyle: 'amap://styles/light'
    })

    mapInstance.on('complete', () => {
      addMarkers()
    })
  } catch (error) {
    console.error('地图初始化失败:', error)
    mapError.value = true
  }
}

function addMarkers() {
  if (!window.AMap) return

  communities.forEach(comm => {
    const marker = new AMap.Marker({
      position: [comm.position.lng, comm.position.lat],
      title: comm.name,
      label: {
        content: `<div class="amap-marker-label">${comm.name}</div>`,
        offset: new AMap.Pixel(0, 30)
      }
    })

    marker.on('click', () => {
      selectCommunity(comm)
    })

    markers.push(marker)
    mapInstance.add(marker)
  })
}

function selectCommunity(comm) {
  selectedCommunity.value = comm
}

function goToCommunity() {
  if (selectedCommunity.value) {
    router.push({ name: 'community', params: { id: selectedCommunity.value.id } })
    selectedCommunity.value = null
  }
}

function retryLoad() {
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
  mapError.value = false
  initMap()
}

onMounted(() => {
  // 高德地图脚本在 HTML 中已加载
  // 等待一小段时间确保 AMap 全局可用
  const checkAndInit = () => {
    if (window.AMap) {
      initMap()
      mapLoaded.value = true
    } else {
      setTimeout(checkAndInit, 500)
    }
  }
  checkAndInit()
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.destroy()
  }
})
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

#amap-container {
  width: 100%;
  height: 100%;
}

.map-loading #amap-container {
  filter: blur(4px);
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #718096;
  z-index: 5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #e53e3e;
  z-index: 5;
}

.map-error p {
  margin-bottom: 12px;
  font-size: 1.1em;
}

.map-error button {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
  z-index: 1000;
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

.amap-marker-label {
  background: rgba(255,255,255,0.95);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
  color: #2d3748;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  text-align: center;
  white-space: nowrap;
}
</style>
