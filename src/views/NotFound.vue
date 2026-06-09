<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <button class="home-btn" @click="$router.push('/')">
          🏠 返回首页
        </button>
        <button class="back-btn" @click="$router.back()">
          ← 返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.not-found-content {
  text-align: center;
  max-width: 480px;
}

.error-code {
  font-size: 8em;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 16px;
}

.not-found-content h2 {
  margin: 0 0 12px;
  color: #2d3748;
  font-size: 1.5em;
}

.not-found-content p {
  margin: 0 0 32px;
  color: #718096;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.home-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.home-btn:hover {
  transform: translateY(-2px);
}

.back-btn {
  padding: 12px 28px;
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5em;
  }
  .actions {
    flex-direction: column;
  }
}
</style>
