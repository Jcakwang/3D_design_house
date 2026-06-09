<template>
  <div class="lazy-image-wrapper" :style="{ aspectRatio }">
    <img
      v-if="src"
      :src="isLoaded || !useLazy ? src : ''"
      :alt="alt"
      :loading="useLazy ? 'lazy' : 'eager'"
      class="lazy-img"
      :class="{ loaded: isLoaded, skeleton: !isLoaded && useLazy }"
      @load="onLoad"
      @error="onError"
    />
    <div v-if="!isLoaded && useLazy" class="lazy-skeleton">
      <div class="skeleton-pulse"></div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  aspectRatio: { type: String, default: 'auto' },
})

const isLoaded = ref(false)
const useLazy = computed(() => !props.src.startsWith('data:'))

function onLoad() {
  isLoaded.value = true
}

function onError(e) {
  console.warn('Image load failed:', props.src)
  isLoaded.value = true
}

// IntersectionObserver 懒加载
onMounted(() => {
  if (!useLazy.value) return
  const img = document.querySelector('.lazy-img')
  if (!img) return

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isLoaded.value) {
          img.src = props.src
          observer.unobserve(entry.target)
        }
      })
    }, { rootMargin: '200px' })
    observer.observe(img)
  }
})
</script>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
  background: #f7fafc;
  border-radius: 8px;
}

.lazy-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-img.loaded {
  opacity: 1;
}

.lazy-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-pulse {
  width: 100%;
  height: 100%;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
