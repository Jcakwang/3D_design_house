<template>
  <div class="map-view">
    <!-- 顶部搜索和筛选 -->
    <div class="map-header">
      <div class="header-content">
        <h2>📍 地图找房</h2>
        <p class="map-subtitle">在地图上浏览各个小区，点击标记查看详情</p>
      </div>
      <SearchBar
        :communities="communitiesRef"
        :floorPlans="[]"
        @search="onSearch"
        @select="onSelectResult"
        @filter="onFilter"
      />
    </div>

    <div class="filter-summary" v-if="hasActiveFilter">
      <span>已激活筛选：{{ activeFilterText }}</span>
      <button @click="resetFilters" class="clear-filter-btn">清除</button>
    </div>

    <!-- 高德地图容器 -->
    <div class="map-container" ref="mapContainerRef">
      <!-- 加载状态 -->
      <div v-if="mapLoading" class="map-loading">
        <div class="spinner"></div>
        <p>地图加载中...</p>
      </div>
      <!-- 加载失败 -->
      <div v-else-if="mapError" class="map-error">
        <p>⚠️ {{ mapError }}</p>
        <button @click="initMap" class="retry-btn">重试</button>
      </div>
      <!-- 地图容器 -->
      <div id="amap-container" class="amap-wrapper" ref="mapDivRef"></div>
    </div>

    <!-- 小区侧边列表（可切换显示） -->
    <div class="side-panel" :class="{ open: sidebarOpen }">
      <div class="panel-header">
        <h3>小区列表（{{ filteredCommunities.length }}）</h3>
        <button @click="sidebarOpen = false" class="close-panel">×</button>
      </div>
      <div class="panel-list">
        <div
          v-for="comm in filteredCommunities"
          :key="comm.id"
          class="panel-item"
          :class="{ active: selectedCommunity?.id === comm.id }"
          @click="selectCommunityFromPanel(comm)"
        >
          <div class="item-info">
            <span class="item-name">{{ comm.name }}</span>
            <span class="item-price">{{ comm.avgPrice }}</span>
          </div>
          <span class="item-address">{{ comm.address }}</span>
        </div>
      </div>
    </div>

    <!-- 地图上的小区标记 -->
    <div class="map-controls">
      <button class="control-btn" @click="toggleSidebar" title="小区列表">
        📋 列表
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import { supabase, communities } from '../lib/supabase'
import { loadAMap, isAMapLoaded } from '../services/amap'

const router = useRouter()

// 地图相关状态
const mapDivRef = ref(null)
const mapContainerRef = ref(null)
const mapLoading = ref(true)
const mapError = ref('')
let mapInstance = null
let markers = []
let infoWindow = null

// 数据
const searchQuery = ref('')
const filters = ref({ priceMin: '', rooms: '' })
const sidebarOpen = ref(false)
const selectedCommunity = ref(null)

const communitiesRef = ref(communities || [])

// 过滤后的小区列表
const filteredCommunities = computed(() => {
  let list = communitiesRef.value
  if (!supabase) {
    list = JSON.parse(JSON.stringify(list))
  }

  // 搜索过滤
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q)
    )
  }

  // 价格过滤
  if (filters.value.priceMin) {
    const minPrice = parseInt(filters.value.priceMin)
    list = list.filter(c => {
      const price = parseInt(c.avgPrice?.replace(/[^\d]/g, ''))
      if (filters.value.priceMin === '0') return price < 30000
      if (filters.value.priceMin === '30000') return price >= 30000 && price < 50000
      if (filters.value.priceMin === '50000') return price >= 50000 && price < 70000
      if (filters.value.priceMin === '70000') return price >= 70000
      return true
    })
  }

  return list
})

const hasActiveFilter = computed(() => searchQuery.value || filters.value.priceMin)
const activeFilterText = computed(() => {
  const parts = []
  if (searchQuery.value) parts.push(`搜索："${searchQuery.value}"`)
  if (filters.value.priceMin === '0') parts.push('3万以下')
  if (filters.value.priceMin === '30000') parts.push('3-5万')
  if (filters.value.priceMin === '50000') parts.push('5-7万')
  if (filters.value.priceMin === '70000') parts.push('7万以上')
  return parts.join('，') || '无'
})

// 搜索回调
function onSearch(query) {
  searchQuery.value = query
}

function onFilter(f) {
  filters.value = { ...f }
}

function onSelectResult(item) {
  if (item.type === 'community') {
    selectCommunity(item)
  }
}

function resetFilters() {
  filters.value = { priceMin: '', rooms: '' }
  searchQuery.value = ''
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function selectCommunity(comm) {
  selectedCommunity.value = comm
  // 地图居中到该小区
  if (mapInstance && comm.position) {
    mapInstance.setCenter(new window.AMap.LngLat(comm.position.lng, comm.position.lat))
    mapInstance.setZoom(16)
    // 打开信息窗
    openInfoWindow(comm)
  }
}

function selectCommunityFromPanel(comm) {
  selectCommunity(comm)
  // 滚动到可视区域
  const el = document.querySelector(`.panel-item[data-id="${comm.id}"]`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function goToCommunity() {
  if (selectedCommunity.value) {
    router.push({ name: 'community', params: { id: selectedCommunity.value.id } })
  }
}

// 打开信息窗
function openInfoWindow(comm) {
  if (!window.AMap) return

  const content = `
    <div style="padding:12px;min-width:200px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <h3 style="margin:0 0 8px;color:#2d3748;font-size:16px;">${comm.name}</h3>
      <p style="margin:4px 0;color:#718096;font-size:13px;">📍 ${comm.address}</p>
      <p style="margin:4px 0;font-weight:bold;color:#e53e3e;font-size:14px;">💰 均价：${comm.avgPrice}</p>
      <p style="margin:4px 0;color:#4a5568;font-size:13px;">${comm.description}</p>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        <span style="background:#edf2f7;padding:3px 10px;border-radius:10px;font-size:12px;color:#4a5568;">
          ${comm.floorPlanIds.length} 个户型
        </span>
      </div>
      <button onclick="window._goToCommunity('${comm.id}')" style="
        margin-top:10px;width:100%;padding:8px 12px;
        background:linear-gradient(135deg,#667eea,#764ba2);
        color:white;border:none;border-radius:8px;
        font-size:14px;font-weight:bold;cursor:pointer;
      ">查看详情 →</button>
    </div>
  `

  if (!infoWindow) {
    infoWindow = new window.AMap.InfoWindow({
      isCustom: false,
      autoMove: true,
      offset: new window.AMap.Pixel(0, -30)
    })
  }

  infoWindow.setContent(content)
  infoWindow.open(mapInstance, new window.AMap.LngLat(comm.position.lng, comm.position.lat))
}

// 高德地图全局跳转
if (typeof window !== 'undefined') {
  window._goToCommunity = function(id) {
    router.push({ name: 'community', params: { id } })
  }
}

// 初始化高德地图
async function initMap() {
  mapLoading.value = true
  mapError.value = ''

  try {
    await loadAMap()

    if (!window.AMap) {
      throw new Error('高德地图加载失败，请检查网络或密钥配置')
    }

    // 创建地图实例，默认居中北京
    mapInstance = new window.AMap.Map('amap-container', {
      zoom: 12,
      center: new window.AMap.LngLat(116.4074, 39.9042),
      mapStyle: 'amap://styles/normal',
      resizeEnable: true,
      showLabel: true // 显示地图-label
    })

    // 添加小区标记点
    addMarkers()

    // 地图点击事件：关闭信息窗
    mapInstance.on('click', () => {
      if (infoWindow) {
        infoWindow.close()
      }
      selectedCommunity.value = null
    })

    mapLoading.value = false
  } catch (err) {
    console.error('地图初始化失败:', err)
    mapError.value = err.message || '地图加载失败'
    mapLoading.value = false
  }
}

// 添加标记点
function addMarkers() {
  // 清除旧标记
  markers.forEach(m => mapInstance.remove(m))
  markers = []

  filteredCommunities.value.forEach(comm => {
    if (!comm.position || !window.AMap) return

    // 创建标记
    const marker = new window.AMap.Marker({
      position: new window.AMap.LngLat(comm.position.lng, comm.position.lat),
      title: comm.name,
      label: {
        content: `<div class="marker-label">${comm.name}</div>`,
        direction: 'bottom'
      },
      offset: new window.AMap.Pixel(0, -30)
    })

    // 点击标记事件
    marker.on('click', (e) => {
      const target = e.target
      const pos = target.getPosition()
      selectCommunity(comm)
      selectedCommunity.value = comm
    })

    mapInstance.add(marker)
    markers.push(marker)
  })
}

onMounted(async () => {
  // 加载数据
  if (supabase) {
    const { data } = await supabase.from('communities').select('*')
    if (data) communitiesRef.value = data
  }

  // 初始化地图
  initMap()
})

onBeforeUnmount(() => {
  // 清理
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
  if (window._goToCommunity) {
    window._goToCommunity = null
  }
})
</script>

<style scoped>
.map-view {
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-header {
  flex-shrink: 0;
  padding: 16px 24px 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  z-index: 20;
}

.header-content {
  text-align: center;
  margin-bottom: 12px;
}

.header-content h2 {
  margin: 0 0 4px;
  color: #2d3748;
  font-size: 1.3em;
}

.map-subtitle {
  margin: 0 0 12px;
  color: #718096;
  font-size: 0.9em;
}

.filter-summary {
  background: #fffbeb;
  border-bottom: 1px solid #fbbf24;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #92400e;
  z-index: 20;
  flex-shrink: 0;
}

.clear-filter-btn {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.amap-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.map-loading,
.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  z-index: 10;
  gap: 12px;
}

.map-loading p,
.map-error p {
  color: #718096;
  font-size: 1em;
}

.retry-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95em;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 地图控件按钮 */
.map-controls {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 30;
}

.control-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  cursor: pointer;
  font-size: 0.95em;
  font-family: inherit;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f7fafc;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* 侧边小区列表 */
.side-panel {
  position: absolute;
  top: 0;
  left: -360px;
  width: 320px;
  height: 100%;
  background: white;
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  z-index: 25;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.side-panel.open {
  left: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1em;
}

.close-panel {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #a0aec0;
}

.close-panel:hover {
  color: #e53e3e;
}

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.panel-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.panel-item:hover {
  background: #ebf4ff;
}

.panel-item.active {
  background: #e8f0fe;
  border-left: 3px solid #667eea;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95em;
}

.item-price {
  color: #e53e3e;
  font-size: 0.85em;
  font-weight: 600;
}

.item-address {
  font-size: 0.8em;
  color: #a0aec0;
}

/* 高德地图标记 label 样式 */
:deep(.marker-label) {
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #2d3748;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  font-weight: 500;
}
</style>
<MAPVIEW_EOF