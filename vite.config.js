import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    cssMinify: true,
    rollupOptions: {
      output: {
        // 分包策略：大型库单独打包
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor'
            }
            if (id.includes('three') || id.includes('tween')) {
              return 'three'
            }
            return 'external'
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true
  }
})
