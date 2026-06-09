import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref('')

  try {
    const savedUser = localStorage.getItem('3d-house-user')
    const savedToken = localStorage.getItem('3d-house-token')
    if (savedUser) user.value = JSON.parse(savedUser)
    if (savedToken) token.value = savedToken
  } catch (e) {
    console.warn('Failed to load auth data', e)
  }

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const displayName = computed(() => user.value?.username || user.value?.nickname || '用户')

  function login(username, password) {
    if (window.__SUPABASE__) {
      return window.__SUPABASE__.auth.signInWithPassword({ email: username + '@3dhouse.local', password })
        .then(({ data, error }) => {
          if (error) throw error
          user.value = { username, nickname: data.user?.user_metadata?.nickname || username, role: 'user' }
          token.value = data.session?.access_token || ''
          localStorage.setItem('3d-house-user', JSON.stringify(user.value))
          localStorage.setItem('3d-house-token', token.value)
          return { user: user.value }
        })
    }
    const users = JSON.parse(localStorage.getItem('3d-house-users') || '[]')
    const found = users.find(u => u.username === username && u.password === password)
    if (!found) throw new Error('用户名或密码错误')
    user.value = { username: found.username, nickname: found.nickname, role: found.role || 'user' }
    token.value = btoa(JSON.stringify(user.value))
    localStorage.setItem('3d-house-user', JSON.stringify(user.value))
    localStorage.setItem('3d-house-token', token.value)
    return { user: user.value }
  }

  function register(username, password, nickname) {
    if (window.__SUPABASE__) {
      return window.__SUPABASE__.auth.signUp({ email: username + '@3dhouse.local', password, data: { nickname, username } })
        .then(({ data, error }) => {
          if (error) throw error
          return data
        })
    }
    const users = JSON.parse(localStorage.getItem('3d-house-users') || '[]')
    if (users.find(u => u.username === username)) throw new Error('用户名已存在')
    const newUser = { username, password, nickname: nickname || username, role: 'user', createdAt: new Date().toISOString() }
    users.push(newUser)
    localStorage.setItem('3d-house-users', JSON.stringify(users))
    return { user: { username, nickname: nickname || username, role: 'user' } }
  }

  function logout() {
    if (window.__SUPABASE__ && token.value) {
      return window.__SUPABASE__.auth.signOut()
    }
    user.value = null
    token.value = ''
    localStorage.removeItem('3d-house-user')
    localStorage.removeItem('3d-house-token')
  }

  function checkAdmin() {
    return isAdmin.value
  }

  return { user, token, isAuthenticated, isAdmin, displayName, login, register, logout, checkAdmin }
})
