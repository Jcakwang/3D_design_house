<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="query"
        type="text"
        placeholder="搜索小区名称、地址..."
        class="search-input"
        @input="$emit('search', query)"
        @focus="isFocused = true"
        @blur="onBlur"
        @clear="onClear"
      />
      <button v-if="query" class="clear-btn" @click="onClear" title="清除">×</button>
    </div>

    <!-- 搜索结果下拉 -->
    <div v-if="isFocused && results.length > 0 && query" class="search-results">
      <div
        v-for="item in results"
        :key="item.id"
        class="result-item"
        @click="$emit('select', item)"
      >
        <span class="result-name">{{ item.name }}</span>
        <span class="result-address">{{ item.address || '' }}</span>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>价格范围：</label>
        <select v-model="filters.priceMin" @change="$emit('filter', filters)">
          <option value="">不限</option>
          <option value="0" :selected="filters.priceMin === '0'">3万以下</option>
          <option value="30000" :selected="filters.priceMin === '30000'">3-5万</option>
          <option value="50000" :selected="filters.priceMin === '50000'">5-7万</option>
          <option value="70000" :selected="filters.priceMin === '70000'">7万以上</option>
        </select>
      </div>
      <div class="filter-group">
        <label>户型：</label>
        <select v-model="filters.rooms" @change="$emit('filter', filters)">
          <option value="">不限</option>
          <option value="1室" :selected="filters.rooms?.startsWith('1室')">一室</option>
          <option value="2室" :selected="filters.rooms?.startsWith('2室')">二室</option>
          <option value="3室" :selected="filters.rooms?.startsWith('3室')">三室</option>
          <option value="4室" :selected="filters.rooms?.startsWith('4室')">四室以上</option>
        </select>
      </div>
      <button class="reset-filter-btn" @click="resetFilters">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watchEffect } from 'vue'

const props = defineProps({
  communities: { type: Array, default: () => [] },
  floorPlans: { type: Array, default: () => [] },
})

const emit = defineEmits(['search', 'select', 'filter'])

const query = ref('')
const isFocused = ref(false)
const results = ref([])

const filters = reactive({
  priceMin: '',
  rooms: '',
})

function onBlur() {
  setTimeout(() => { isFocused.value = false }, 200)
}

function onClear() {
  query.value = ''
  results.value = []
  emit('search', '')
}

function resetFilters() {
  filters.priceMin = ''
  filters.rooms = ''
  emit('filter', filters)
}

// 搜索建议
let debounceTimer
watchEffect(() => {
  if (!query.value) { results.value = []; return }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const q = query.value.toLowerCase()
    const communityResults = props.communities.filter(c =>
      c.name?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q)
    ).map(c => ({ ...c, type: 'community' }))
    const floorPlanResults = props.floorPlans.filter(fp =>
      fp.name?.toLowerCase().includes(q) || fp.description?.toLowerCase().includes(q)
    ).map(fp => ({ ...fp, type: 'floorplan', address: '' })).slice(0, 5)
    results.value = [...communityResults, ...floorPlanResults].slice(0, 8)
  }, 200)
})
</script>

<style scoped>
.search-bar {
  padding: 0 0 16px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 1.1em;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  background: white;
}

.search-input:focus {
  border-color: #667eea;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.4em;
  color: #a0aec0;
  cursor: pointer;
  padding: 0 4px;
}

.clear-btn:hover {
  color: #e53e3e;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #667eea;
  border-top: none;
  border-radius: 0 0 12px 12px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.result-item {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid #edf2f7;
}

.result-item:hover {
  background: #ebf4ff;
}

.result-item:last-child {
  border-bottom: none;
}

.result-name {
  font-weight: 600;
  color: #2d3748;
}

.result-address {
  font-size: 0.85em;
  color: #718096;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  color: #4a5568;
}

.filter-group select {
  padding: 6px 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9em;
  outline: none;
  font-family: inherit;
  background: white;
  cursor: pointer;
}

.filter-group select:focus {
  border-color: #667eea;
}

.reset-filter-btn {
  padding: 6px 14px;
  background: #edf2f7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  color: #4a5568;
  font-family: inherit;
}

.reset-filter-btn:hover {
  background: #e2e8f0;
}
</style>
