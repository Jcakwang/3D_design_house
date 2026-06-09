import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { logger } from './lib/logger'
import { supabase } from './lib/supabase'

// 将 Supabase 实例暴露给全局供 auth store 使用
if (supabase) {
  window.__SUPABASE__ = supabase
}

// 全局错误边界
const app = createApp(App)
app.use(createPinia())
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  logger.error(`Vue error in ${info}: ${err.message}`, err)
}

// 全局注册 LazyImage 组件
import LazyImage from './components/LazyImage.vue'
app.component('LazyImage', LazyImage)

const mounted = app.mount('#app')

// 将 app 实例挂载到 window 以便调试
window.__APP__ = mounted

logger.info('App initialized')
