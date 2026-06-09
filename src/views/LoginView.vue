<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h2>🏠 3D看房工具</h2>
        <p>{{ isRegister ? '创建账户' : '登录账户' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="nickname">昵称（注册用）</label>
          <input
            id="nickname"
            v-model="form.nickname"
            type="text"
            placeholder="请输入昵称"
            :required="isRegister"
            autocomplete="name"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>

        <div class="switch-mode">
          <span v-if="isRegister">已有账户？</span>
          <button type="button" class="link-btn" @click="toggleMode">
            {{ isRegister ? '去登录' : '去注册' }}
          </button>
          <span v-if="!isRegister">，还没有账户？</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isRegister = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const form = ref({ username: '', nickname: '', password: '' })

function toggleMode() {
  isRegister.value = !isRegister.value
  errorMsg.value = ''
  form.value = { username: '', nickname: '', password: '' }
}

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''

  try {
    if (isRegister.value) {
      if (!form.value.nickname) {
        throw new Error('请输入昵称')
      }
      await auth.register(form.value.username, form.value.password, form.value.nickname)
      alert('注册成功！请登录')
      toggleMode()
    } else {
      await auth.login(form.value.username, form.value.password)
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = err.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 8px;
  color: #2d3748;
  font-size: 1.6em;
}

.login-header p {
  color: #718096;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9em;
  font-weight: 600;
  color: #4a5568;
}

.form-group input {
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1em;
  transition: border-color 0.2s;
  outline: none;
  font-family: inherit;
}

.form-group input:focus {
  border-color: #667eea;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.85em;
  text-align: center;
  background: #fff5f5;
  padding: 8px;
  border-radius: 8px;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.05em;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: inherit;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-mode {
  text-align: center;
  font-size: 0.9em;
  color: #718096;
}

.link-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  font-size: 0.9em;
}

.link-btn:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
}
</style>
