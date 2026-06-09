<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2>🛠️ 后台管理</h2>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>

    <div class="admin-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 小区管理 -->
    <div v-if="activeTab === 'communities'" class="admin-section">
      <div class="section-header">
        <h3>小区管理</h3>
        <button class="add-btn" @click="openCommunityDialog">+ 添加小区</button>
      </div>

      <div v-if="communities.length === 0" class="empty-hint">
        暂无小区数据
      </div>

      <div v-else class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>地址</th>
              <th>均价</th>
              <th>户型数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in communities" :key="c.id">
              <td>{{ c.name }}</td>
              <td>{{ c.address }}</td>
              <td>{{ c.avgPrice }}</td>
              <td>{{ (c.floorPlanIds || []).length }}</td>
              <td class="actions">
                <button class="edit-btn" @click="editCommunity(c)">编辑</button>
                <button class="delete-btn" @click="deleteCommunity(c.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 户型管理 -->
    <div v-if="activeTab === 'floorplans'" class="admin-section">
      <div class="section-header">
        <h3>户型管理</h3>
        <button class="add-btn" @click="openFloorPlanDialog">+ 添加户型</button>
      </div>

      <div v-if="floorPlans.length === 0" class="empty-hint">
        暂无户型数据
      </div>

      <div v-else class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>面积</th>
              <th>户型</th>
              <th>朝向</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fp in floorPlans" :key="fp.id">
              <td>{{ fp.name }}</td>
              <td>{{ fp.area }}</td>
              <td>{{ fp.rooms }}</td>
              <td>{{ fp.direction }}</td>
              <td class="actions">
                <button class="edit-btn" @click="editFloorPlan(fp)">编辑</button>
                <button class="delete-btn" @click="deleteFloorPlan(fp.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 用户管理 -->
    <div v-if="activeTab === 'users'" class="admin-section">
      <div class="section-header">
        <h3>用户管理</h3>
      </div>

      <div v-if="users.length === 0" class="empty-hint">
        暂无用户数据
      </div>

      <div v-else class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>昵称</th>
              <th>角色</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.username">
              <td>{{ u.username }}</td>
              <td>{{ u.nickname }}</td>
              <td>
                <span class="role-badge" :class="u.role">{{ u.role === 'admin' ? '管理员' : '普通用户' }}</span>
              </td>
              <td>{{ u.createdAt || '-' }}</td>
              <td class="actions">
                <button
                  class="role-btn"
                  @click="toggleUserRole(u.username)"
                >
                  {{ u.role === 'admin' ? '降为普通用户' : '提升为管理员' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 小区编辑对话框 -->
    <div v-if="showCommunityDialog" class="modal-overlay" @click.self="showCommunityDialog = false">
      <div class="modal">
        <h3>{{ editingCommunity ? '编辑小区' : '添加小区' }}</h3>
        <form @submit.prevent="saveCommunity">
          <div class="form-row">
            <label>名称</label>
            <input v-model="communityForm.name" required />
          </div>
          <div class="form-row">
            <label>地址</label>
            <input v-model="communityForm.address" required />
          </div>
          <div class="form-row">
            <label>均价</label>
            <input v-model="communityForm.avgPrice" placeholder="如：58000元/㎡" />
          </div>
          <div class="form-row">
            <label>描述</label>
            <textarea v-model="communityForm.description" rows="2"></textarea>
          </div>
          <div class="form-row">
            <label>关联户型（逗号分隔）</label>
            <input v-model="communityForm.floorPlanIdsStr" />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showCommunityDialog = false">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 户型编辑对话框 -->
    <div v-if="showFloorPlanDialog" class="modal-overlay" @click.self="showFloorPlanDialog = false">
      <div class="modal">
        <h3>{{ editingFloorPlan ? '编辑户型' : '添加户型' }}</h3>
        <form @submit.prevent="saveFloorPlan">
          <div class="form-row">
            <label>名称</label>
            <input v-model="floorPlanForm.name" required />
          </div>
          <div class="form-row">
            <label>面积</label>
            <input v-model="floorPlanForm.area" placeholder="如：89㎡" />
          </div>
          <div class="form-row">
            <label>户型</label>
            <input v-model="floorPlanForm.rooms" placeholder="如：2室2厅1卫" />
          </div>
          <div class="form-row">
            <label>朝向</label>
            <input v-model="floorPlanForm.direction" placeholder="如：南北朝向" />
          </div>
          <div class="form-row">
            <label>描述</label>
            <textarea v-model="floorPlanForm.description" rows="2"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showFloorPlanDialog = false">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { communities as mockCommunities, floorPlans as mockFloorPlans } from '../data/mock'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('communities')
const tabs = [
  { id: 'communities', label: '小区管理' },
  { id: 'floorplans', label: '户型管理' },
  { id: 'users', label: '用户管理' },
]

const communities = ref([])
const floorPlans = ref([])
const users = ref([])

const showCommunityDialog = ref(false)
const showFloorPlanDialog = ref(false)
const editingCommunity = ref(null)
const editingFloorPlan = ref(null)

const communityForm = ref({ name: '', address: '', avgPrice: '', description: '', floorPlanIdsStr: '' })
const floorPlanForm = ref({ name: '', area: '', rooms: '', direction: '', description: '' })

function loadData() {
  const savedCommunities = JSON.parse(localStorage.getItem('3d-house-communities') || 'null')
  const savedFloorPlans = JSON.parse(localStorage.getItem('3d-house-floorplans') || 'null')

  communities.value = savedCommunities || JSON.parse(JSON.stringify(mockCommunities))
  floorPlans.value = savedFloorPlans || JSON.parse(JSON.stringify(mockFloorPlans))
  users.value = JSON.parse(localStorage.getItem('3d-house-users') || '[]')
}

function saveData() {
  localStorage.setItem('3d-house-communities', JSON.stringify(communities.value))
  localStorage.setItem('3d-house-floorplans', JSON.stringify(floorPlans.value))
}

// 小区 CRUD
function openCommunityDialog() {
  editingCommunity.value = null
  communityForm.value = { name: '', address: '', avgPrice: '', description: '', floorPlanIdsStr: '' }
  showCommunityDialog.value = true
}

function editCommunity(c) {
  editingCommunity.value = c.id
  const copy = JSON.parse(JSON.stringify(c))
  communityForm.value = {
    name: copy.name,
    address: copy.address,
    avgPrice: copy.avgPrice,
    description: copy.description,
    floorPlanIdsStr: (copy.floorPlanIds || []).join(','),
  }
  showCommunityDialog.value = true
}

function saveCommunity() {
  const floorPlanIds = communityForm.value.floorPlanIdsStr
    ? communityForm.value.floorPlanIdsStr.split(',').map(s => s.trim()).filter(Boolean)
    : []

  if (editingCommunity.value) {
    const idx = communities.value.findIndex(c => c.id === editingCommunity.value)
    if (idx !== -1) {
      communities.value[idx] = { ...communities.value[idx], ...communityForm.value, floorPlanIds }
    }
  } else {
    communities.value.push({
      id: 'c' + Date.now(),
      ...communityForm.value,
      floorPlanIds,
      position: { lat: 39.9042, lng: 116.4074 },
    })
  }

  saveData()
  showCommunityDialog.value = false
}

function deleteCommunity(id) {
  if (!confirm('确认删除该小区？')) return
  communities.value = communities.value.filter(c => c.id !== id)
  saveData()
}

// 户型 CRUD
function openFloorPlanDialog() {
  editingFloorPlan.value = null
  floorPlanForm.value = { name: '', area: '', rooms: '', direction: '', description: '' }
  showFloorPlanDialog.value = true
}

function editFloorPlan(fp) {
  editingFloorPlan.value = fp.id
  floorPlanForm.value = { name: fp.name, area: fp.area, rooms: fp.rooms, direction: fp.direction, description: fp.description }
  showFloorPlanDialog.value = true
}

function saveFloorPlan() {
  if (editingFloorPlan.value) {
    const idx = floorPlans.value.findIndex(fp => fp.id === editingFloorPlan.value)
    if (idx !== -1) {
      floorPlans.value[idx] = { ...floorPlans.value[idx], ...floorPlanForm.value }
    }
  } else {
    floorPlans.value.push({
      id: 'fp' + Date.now(),
      ...floorPlanForm.value,
      layout: { width: 12, depth: 10, height: 3, rooms: [{ name: '客厅', x: 0, z: 0, w: 6, d: 5 }] },
    })
  }

  saveData()
  showFloorPlanDialog.value = false
}

function deleteFloorPlan(id) {
  if (!confirm('确认删除该户型？')) return
  floorPlans.value = floorPlans.value.filter(fp => fp.id !== id)
  saveData()
}

// 用户管理
function toggleUserRole(username) {
  const user = users.value.find(u => u.username === username)
  if (!user) return
  user.role = user.role === 'admin' ? 'user' : 'admin'
  localStorage.setItem('3d-house-users', JSON.stringify(users.value))
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(loadData)
</script>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-header h2 {
  margin: 0;
  color: #2d3748;
}

.logout-btn {
  padding: 8px 20px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-family: inherit;
}

.logout-btn:hover {
  background: #c53030;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  padding: 10px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1em;
  color: #718096;
  font-family: inherit;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: bold;
}

.admin-section {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  color: #2d3748;
}

.add-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-family: inherit;
}

.add-btn:hover {
  opacity: 0.9;
}

.admin-table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.admin-table th,
.admin-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}

.admin-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9em;
}

.admin-table td {
  color: #2d3748;
}

.admin-table .actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 4px 12px;
  background: #ebf4ff;
  color: #3182ce;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-family: inherit;
}

.edit-btn:hover {
  background: #dbeafe;
}

.delete-btn {
  padding: 4px 12px;
  background: #fff5f5;
  color: #e53e3e;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-family: inherit;
}

.delete-btn:hover {
  background: #fee2e2;
}

.role-badge {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.85em;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background: #edf2f7;
  color: #4a5568;
}

.role-btn {
  padding: 4px 12px;
  background: #f0fff4;
  color: #276749;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-family: inherit;
}

.role-btn:hover {
  background: #c6f6d5;
}

.empty-hint {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
}

/* 对话框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 20px;
  color: #2d3748;
}

.form-row {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row label {
  font-size: 0.9em;
  font-weight: 600;
  color: #4a5568;
}

.form-row input,
.form-row textarea {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1em;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-row input:focus,
.form-row textarea:focus {
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #edf2f7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.save-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
}

.save-btn:hover {
  opacity: 0.9;
}
</style>
