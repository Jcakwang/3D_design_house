/**
 * HTTP 请求封装
 * 统一处理请求/响应拦截、错误提示
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 通用请求方法
 */
async function request(url, options = {}) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json', ...options.headers }
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, { ...defaultOptions, ...options })
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

export const api = {
  get(url, options) { return request(url, { ...options, method: 'GET' }) },
  post(url, data, options) { return request(url, { ...options, method: 'POST', body: JSON.stringify(data) }) }
}
