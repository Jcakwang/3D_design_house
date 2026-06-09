/**
 * Service Worker for 3D House Viewer PWA
 * 缓存策略：静态资源使用 CacheFirst，API 使用 NetworkFirst
 */

const CACHE_NAME = '3d-house-viewer-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg'
]

// 安装时预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).catch(() => {
      // 忽略缓存失败
    })
  )
  self.skipWaiting()
})

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 请求使用 NetworkFirst
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // 静态资源使用 CacheFirst
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone)
        })
        return response
      })
    })
  )
})

// 前台状态变更
self.addEventListener('online', () => console.log('Network: Online'))
self.addEventListener('offline', () => console.log('Network: Offline'))
