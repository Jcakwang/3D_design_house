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
import { floorPlans, decorationStyles } from '../data/mock'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const viewerRef = ref(null)

const currentFloorPlan = computed(() =>
  floorPlans.find(fp => fp.id === route.params.id)
)
const currentStyle = ref('modern')
const styles = ref(decorationStyles)

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
  const colors = decorationStyles.find(s => s.id === currentStyle.value)?.colors
    || decorationStyles[1].colors

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
  const ceilMat = new THREE.MeshStandardMaterial({ color: colors.ceiling, roughness: 0.9 })
  const ceiling = new THREE.Mesh(ceilGeo, ceilMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(width / 2, roomH, depth / 2)
  roomGroup.add(ceiling)

  const wallMat = new THREE.MeshStandardMaterial({ color: colors.wall, roughness: 0.7, side: THREE.DoubleSide })

  // 后墙
  createRoomMesh(new THREE.PlaneGeometry(width, roomH), colors.wall, [width / 2, roomH / 2, 0], null, roomGroup)
  // 左墙
  createRoomMesh(new THREE.PlaneGeometry(depth, roomH), colors.wall, [0, roomH / 2, depth / 2], Math.PI / 2, roomGroup)
  // 右墙
  createRoomMesh(new THREE.PlaneGeometry(depth, roomH), colors.wall, [width, roomH / 2, depth / 2], -Math.PI / 2, roomGroup)

  // 前墙 - 半墙
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(width, roomH * 0.35),
    new THREE.MeshStandardMaterial({ color: colors.wall, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
  )
  frontWall.rotation.y = Math.PI
  frontWall.position.set(width / 2, roomH * 0.82, depth)
  roomGroup.add(frontWall)

  // 内部分隔墙（半透明）
  const innerMat = new THREE.MeshStandardMaterial({
    color: colors.accent, roughness: 0.6, side: THREE.DoubleSide,
    transparent: true, opacity: 0.35
  })
  rooms.forEach((room, i) => {
    if (i === 0) return
    // 右侧隔墙
    const w1 = new THREE.Mesh(new THREE.PlaneGeometry(room.d, roomH * 0.85), innerMat)
    w1.position.set(room.x + room.w, (roomH * 0.85) / 2, room.z + room.d / 2)
    w1.rotation.y = Math.PI / 2
    roomGroup.add(w1)
    // 下侧隔墙
    const w2 = new THREE.Mesh(new THREE.PlaneGeometry(room.w, roomH * 0.85), innerMat)
    w2.position.set(room.x + room.w / 2, (roomH * 0.85) / 2, room.z + room.d)
    roomGroup.add(w2)
  })

  // 房间标签
  rooms.forEach(room => {
    addLabel(scene, room.name,
      [room.x + room.w / 2, roomH * 0.7, room.z + room.d / 2],
      roomGroup)
  })

  // 简单家具
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.8 })
  // 沙发
  const sofa = new THREE.Mesh(new THREE.BoxGeometry(2, 0.45, 0.7), sofaMat)
  sofa.position.set(2, 0.225, 2.5)
  sofa.castShadow = true
  roomGroup.add(sofa)
  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2, 0.55, 0.12), sofaMat)
  sofaBack.position.set(2, 0.5, 2.1)
  roomGroup.add(sofaBack)

  // 茶几
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 })
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.7), tableMat)
  table.position.set(3.5, 0.45, 2.5)
  table.castShadow = true
  roomGroup.add(table)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x666666 })
  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45)
  [[-0.5, -0.28], [-0.5, 0.28], [0.5, -0.28], [0.5, 0.28]].forEach(([dx, dz]) => {
    const leg = new THREE.Mesh(legGeo, legMat)
    leg.position.set(3.5 + dx, 0.225, 2.5 + dz)
    roomGroup.add(leg)
  })

  // 床（主卧示意）
  const bedMat = new THREE.MeshStandardMaterial({ color: 0xd4c5b2, roughness: 0.9 })
  const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2, 0.35, 1.8), bedMat)
  bedBase.position.set(fp.layout.width - 3, 0.175, fp.layout.depth * 0.25)
  bedBase.castShadow = true
  roomGroup.add(bedBase)
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.5), pillowMat)
  pillow.position.set(fp.layout.width - 3, 0.4, fp.layout.depth * 0.25 - 0.55)
  roomGroup.add(pillow)

  scene.add(roomGroup)

  // 相机飞入动画
  const startPos = camera.position.clone()
  const endPos = new THREE.Vector3(width * 0.55, roomH * 1.3, depth * 0.75)
  const startTime = performance.now()
  const duration = 800
  const animateCamera = () => {
    const elapsed = performance.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    camera.position.lerpVectors(startPos, endPos, ease)
    camera.lookAt(width / 2, roomH * 0.3, depth / 2)
    if (progress < 1) requestAnimationFrame(animateCamera)
  }
  animateCamera()
}

function changeStyle(style) {
  currentStyle.value = style.id
  if (!roomGroup) return
  const colors = style.colors
  const fp = currentFloorPlan.value
  if (!fp) return
  const { height: roomH, depth, width } = fp.layout

  roomGroup.traverse(child => {
    if (child.isMesh && child.material && !child.material.transparent) {
      const y = child.position.y
      const z = child.position.z
      const x = child.position.x
      const halfW = width / 2
      const halfD = depth / 2

      let targetColor
      if (Math.abs(y) < 0.05) {
        targetColor = colors.floor       // 地板
      } else if (Math.abs(y - roomH) < 0.05) {
        targetColor = colors.ceiling     // 天花板
      } else if (Math.abs(z) < 0.05 || Math.abs(z - depth) < 0.05) {
        targetColor = colors.wall        // 前后墙
      } else if (Math.abs(x) < 0.05 || Math.abs(x - width) < 0.05) {
        targetColor = colors.wall        // 左右墙
      } else {
        targetColor = colors.wall        // 家具默认墙色
      }

      const oldColor = child.material.color.clone()
      const newColor = new THREE.Color(targetColor)
      animateColor(child.material.color, oldColor, newColor, 600)
    }
  })
}

function getStylePreview(style) {
  const c = style.colors
  const f = '#' + c.floor.toString(16).padStart(6, '0')
  const w = '#' + c.wall.toString(16).padStart(6, '0')
  const a = '#' + c.accent.toString(16).padStart(6, '0')
  return { background: `linear-gradient(135deg, ${w} 0%, ${f} 50%, ${a} 100%)` }
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

onMounted(() => {
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