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
            <LazyImage :src="fp.image" :alt="fp.name" class="floorplan-img">
              <div class="img-placeholder">🏠</div>
            </LazyImage>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase, communities, floorPlans as allFloorPlans } from '../lib/supabase'
import floorPlanA from '../assets/floor-plan-a.svg'
import floorPlanB from '../assets/floor-plan-b.svg'
import floorPlanC from '../assets/floor-plan-c.svg'
import LazyImage from '../components/LazyImage.vue'

const route = useRoute()
const router = useRouter()

const communityRef = ref(null)
const communitiesRef = ref(communities || [])
const floorPlansRef = ref(allFloorPlans || [])

function normalizeCommunity(c) {
  return {
    ...c,
    avgPrice: c.avg_price || c.avgPrice,
    floorPlanIds: c.floor_plan_ids || c.floorPlanIds || []
  }
}

const community = computed(() => {
  if (supabase) {
    return communitiesRef.value.find(c => c.id === route.params.id)
  }
  return communities.find(c => c.id === route.params.id)
})

const imageMap = {
  'fp1': floorPlanA,
  'fp2': floorPlanB,
  'fp3': floorPlanC,
}

const floorPlans = computed(() => {
  if (!community.value) return []
  const source = supabase ? floorPlansRef.value : allFloorPlans
  return source
    .filter(fp => community.value.floorPlanIds.includes(fp.id))
    .map(fp => ({ ...fp, image: imageMap[fp.id] }))
})

function goToHouse(fp) {
  router.push({
    name: 'house',
    params: { id: fp.id },
    query: { community: community.value?.name || '' }
  })
}

async function loadData() {
  if (supabase) {
    const { data } = await supabase.from('communities').select('*')
    if (data) communitiesRef.value = data.map(normalizeCommunity)
    const { data: fpData } = await supabase.from('floor_plans').select('*')
    if (fpData) floorPlansRef.value = fpData
  }
}

onMounted(loadData)
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
  font-family: inherit;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e2e8f0;
}

.floorplan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

.img-placeholder {
  font-size: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
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
  font-family: inherit;
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
