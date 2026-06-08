import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])

  // 从 localStorage 加载
  try {
    const saved = localStorage.getItem('3d-house-favorites')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load favorites from localStorage', e)
  }

  // 保存到 localStorage
  watch(favorites, (val) => {
    localStorage.setItem('3d-house-favorites', JSON.stringify(val))
  }, { deep: true })

  function isFavorite(id) {
    return favorites.value.some(f => f.id === id)
  }

  function addFavorite(house) {
    if (!isFavorite(house.id)) {
      favorites.value.push({
        id: house.id,
        name: house.name,
        area: house.area,
        rooms: house.rooms,
        communityName: house.communityName || ''
      })
    }
  }

  function removeFavorite(id) {
    favorites.value = favorites.value.filter(f => f.id !== id)
  }

  return { favorites, isFavorite, addFavorite, removeFavorite }
})
