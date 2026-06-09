/**
 * 高德地图服务 - 配置加载与地图初始化
 * 从环境变量加载安全密钥和 Key，支持 fallback
 */

const AMAP_SECURITY_KEY = import.meta.env.VITE_AMAP_SECURITY_KEY || import.meta.env.VITE_AMAP_KEY || '084c94186c480e019a34687c67db84ff'
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '084c94186c480e019a34687c67db84ff'

export { AMAP_SECURITY_KEY, AMAP_KEY }

/**
 * 动态加载高德地图脚本
 * @returns {Promise<void>}
 */
export function loadAMap() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve()
      return
    }

    // 设置安全配置
    if (typeof window._AMapSecurityConfig === 'undefined') {
      window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_KEY }
    }

    const script = document.createElement('script')
    script.src = `https://web.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Marker,AMap.InfoWindow`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('高德地图加载失败，请检查网络连接'))
    document.head.appendChild(script)
  })
}

/**
 * 检查高德地图是否已加载
 * @returns {boolean}
 */
export function isAMapLoaded() {
  return typeof window.AMap !== 'undefined'
}
