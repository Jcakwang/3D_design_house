<template>
  <div class="house-view">
    <div class="house-toolbar">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h3 class="house-title">{{ currentFloorPlan?.name || '3D看房' }}</h3>
      <button class="fav-btn" @click="toggleFavorite">
        {{ isFav ? '❤️ 已收藏' : '🤍 收藏户型' }}
      </button>
    </div>

    <div class="viewer-container" ref="viewerRef">
      <div id="three-canvas" class="canvas-container"></div>

      <div class="decoration-panel">
        <div class="panel-title">🎨 装修风格</div>
        <div class="style-options">
          <button
            v-for="style in styles"
            :key="style.id"
            class="style-btn"
            :class="{ active: currentStyle === style.id }"
            @click="changeStyle(style)"
            :title="style.description"
          >
            <div class="style-preview" :style="getStylePreview(style)"></div>
            <span>{{ style.name }}</span>
          </button>
        </div>
      </div>

      <div class="hint-bar">
        <span>🖱️ 左键拖拽旋转 · 滚轮缩放 · 右键拖拽平移</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoritesStore } from '../stores/favorites'
import { supabase, floorPlans, decorationStyles } from '../lib/supabase'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()

const floorPlansRef = ref(floorPlans || [])
const decorationStylesRef = ref(decorationStyles || [])
const currentStyle = ref('modern')
const viewerRef = ref(null)

const currentFloorPlan = computed(() => {
  // 优先从 Supabase 数据中查找
  if (supabase && floorPlansRef.value.length > 0) {
    return floorPlansRef.value.find(fp => fp.id === route.params.id)
  }
  // fallback 到 mock 数据
  return floorPlans.find(fp => fp.id === route.params.id)
})

const styles = computed(() => {
  if (supabase && decorationStylesRef.value.length > 0) {
    return decorationStylesRef.value
  }
  return decorationStyles
})

const isFav = computed(() =>
  currentFloorPlan.value ? favoritesStore.isFavorite(currentFloorPlan.value.id) : false
)

let scene, camera, renderer, controls
let roomGroup
let animationId
let tweenAnimations = []

function animateColor(color, start, end, duration) {
  return new Promise(resolve => {
    const startTime = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      color.r = start.r + (end.r - start.r) * ease
      color.g = start.g + (end.g - start.g) * ease
      color.b = start.b + (end.b - start.b) * ease
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

function resizeCanvas() {
  const container = viewerRef.value?.querySelector('.canvas-container')
  if (!container) return
  const width = container.clientWidth
  const height = container.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function createRoomMesh(geometry, color, pos, rotY, parent) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, mat)
  if (pos) mesh.position.set(pos[0], pos[1], pos[2])
  if (rotY) mesh.rotation.y = rotY
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function addLabel(scene3, text, position, parent) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, 256, 64)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 28px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, 128, 40)
  const texture = new THREE.CanvasTexture(canvas)
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(spriteMat)
  sprite.position.set(position[0], position[1], position[2])
  sprite.scale.set(2, 0.5, 1)
  parent.add(sprite)
}

function buildRoom() {
  if (roomGroup) {
    scene.remove(roomGroup)
    roomGroup.traverse(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
        else child.material.dispose()
      }
    })
  }
  roomGroup = new THREE.Group()

  const fp = currentFloorPlan.value
  if (!fp) return

  const { width, depth, height: roomH, rooms } = fp.layout
  const colors = styles.value.find(s => s.id === currentStyle.value)?.colors
    || styles.value[1]?.colors || { floor: 0x666666, wall: 0xeeeeee, ceiling: 0xffffff, accent: 0x333333 }

  // 地板
  const floorGeo = new THREE.PlaneGeometry(width, depth)
  const floorMat = new THREE.MeshStandardMaterial({ color: colors.floor, roughness: 0.8, metalness: 0.1 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(width / 2, 0, depth / 2)
  floor.receiveShadow = true
  roomGroup.add(floor)

  // 天花板
  const ceilGeo = new THREE.PlaneGeometry(width, depth)
  const ceilMat = new THREE.MeshStandardMaterial({ color: colors.ceiling, roughness: 0.9, side: THREE.DoubleSide })
  const ceil = new THREE.Mesh(ceilGeo, ceilMat)
  ceil.rotation.x = Math.PI / 2
  ceil.position.set(width / 2, roomH, depth / 2)
  roomGroup.add(ceil)

  // 房间分隔
  rooms.forEach((room, i) => {
    const wallThickness = 0.1
    const wallHeight = roomH
    const halfT = wallThickness / 2

    // 右墙
    if (i === 0 || rooms[i - 1]?.x + rooms[i - 1]?.w < room.x + room.w) {
      const wallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, room.d)
      const wallMat = new THREE.MeshStandardMaterial({ color: colors.wall, roughness: 0.8 })
      const wall = new THREE.Mesh(wallGeo, wallMat)
      wall.position.set(room.x + room.w + halfT, wallHeight / 2, room.z + room.d / 2)
      wall.receiveShadow = true
      roomGroup.add(wall)
    }

    // 上墙
    if (i === 0 || rooms[i - 1]?.z + rooms[i - 1]?.d < room.z + room.d) {
      const wallGeo = new THREE.BoxGeometry(room.w, wallHeight, wallThickness)
      const wallMat = new THREE.MeshStandardMaterial({ color: colors.wall, roughness: 0.8 })
      const wall = new THREE.Mesh(wallGeo, wallMat)
      wall.position.set(room.x + room.w / 2, wallHeight / 2, room.z + room.d + halfT)
      wall.receiveShadow = true
      roomGroup.add(wall)
    }

    // 房间标签
    addLabel(scene, room.name, [room.x + room.w / 2, roomH + 0.3, room.z + room.d / 2], roomGroup)
  })

  // 前墙（有门洞）
  const frontWallGeo = new THREE.PlaneGeometry(width, roomH)
  const frontWallMat = new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.8,
    side: THREE.DoubleSide
  })
  const frontWall = new THREE.Mesh(frontWallGeo, frontWallMat)
  frontWall.position.set(width / 2, roomH / 2, 0)
  frontWall.rotation.y = Math.PI
  frontWall.receiveShadow = true
  roomGroup.add(frontWall)

  scene.add(roomGroup)
}

function changeStyle(style) {
  currentStyle.value = style.id
  buildRoom()
}

function getStylePreview(style) {
  const c = style.colors
  return {
    background: `linear-gradient(135deg, 
      #${c.floor.toString(16).padStart(6, '0')} 0%, 
      #${c.wall.toString(16).padStart(6, '0')} 50%, 
      #${c.ceiling.toString(16).padStart(6, '0')} 100%)`
  }
}

function toggleFavorite() {
  if (!currentFloorPlan.value) return
  if (isFav.value) {
    favoritesStore.removeFavorite(currentFloorPlan.value.id)
  } else {
    favoritesStore.addFavorite({
      id: currentFloorPlan.value.id,
      name: currentFloorPlan.value.name,
      area: currentFloorPlan.value.area,
      rooms: currentFloorPlan.value.rooms,
      communityName: route.query.community || ''
    })
  }
}

function goBack() {
  const fp = currentFloorPlan.value
  if (fp) {
    router.push({ name: 'community', query: { community: fp.name } })
  } else {
    router.push('/')
  }
}

function initThreeJS() {
  const container = viewerRef.value.querySelector('.canvas-container')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f4f8)

  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000)
  camera.position.set(10, 8, 10)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
  resizeCanvas()

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.4))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(10, 20, 10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048)
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 50
  dirLight.shadow.camera.left = -15
  dirLight.shadow.camera.right = 15
  dirLight.shadow.camera.top = 15
  dirLight.shadow.camera.bottom = -15
  scene.add(dirLight)
  const pointLight = new THREE.PointLight(0xffeedd, 0.3, 30)
  pointLight.position.set(0, 5, 0)
  scene.add(pointLight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.maxPolarAngle = Math.PI / 2.05
  controls.minDistance = 3
  controls.maxDistance = 30
  controls.target.set(4, 1, 3)

  buildRoom()

  const grid = new THREE.GridHelper(30, 30, 0xcccccc, 0xe8e8e8)
  grid.position.y = -0.01
  scene.add(grid)

  function animate() {
    animationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', resizeCanvas)
}

onMounted(async () => {
  // 从 Supabase 加载户型和装修风格数据
  if (supabase) {
    const { data: fpData } = await supabase.from('floor_plans').select('*')
    if (fpData) {
      floorPlansRef.value = fpData
    }
    const { data: styleData } = await supabase.from('decoration_styles').select('*')
    if (styleData) {
      decorationStylesRef.value = styleData
    }
  }
  initThreeJS()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
  if (scene) scene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
      else obj.material.dispose()
    }
  })
})
</script>

<style scoped>
.house-view {
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
}

.house-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 10;
}

.back-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  color: #4a5568;
}
.back-btn:hover { background: #f7fafc; }

.house-title {
  margin: 0;
  color: #2d3748;
  font-size: 1.2em;
}

.fav-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
}
.fav-btn:hover { background: #fff5f5; border-color: #feb2b2; }

.viewer-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.decoration-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  z-index: 20;
  min-width: 190px;
}

.panel-title {
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 12px;
  font-size: 0.95em;
}

.style-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.style-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
  text-align: left;
  width: 100%;
}
.style-btn:hover { background: #edf2f7; }
.style-btn.active { border-color: #667eea; background: #ebf4ff; }

.style-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}

.hint-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85em;
  z-index: 20;
  white-space: nowrap;
}
</style>
