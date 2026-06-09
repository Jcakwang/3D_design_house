/**
 * 前端日志上报工具
 * 收集运行时错误、性能数据、用户行为日志
 * 生产环境将日志发送到后端 API，开发环境仅输出到 console
 */

const LOG_ENDPOINT = import.meta.env.VITE_LOG_ENDPOINT || ''

export const logger = {
  _buffer: [],
  _flushing: false,
  _maxBuffer: 50,

  info(message, data) {
    this._log('info', message, data)
  },

  error(message, error) {
    const errorData = {
      message,
      stack: error?.stack || 'No stack trace',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }
    this._log('error', message, errorData)
  },

  warn(message, data) {
    this._log('warn', message, data)
  },

  _log(level, message, data) {
    const entry = { level, message, data, ts: Date.now() }

    // 开发环境输出 console
    if (level === 'error') {
      console.error(`[ERROR] ${message}`, data || entry)
    } else if (level === 'warn') {
      console.warn(`[WARN] ${message}`, data || entry)
    } else {
      console.log(`[INFO] ${message}`, data || entry)
    }

    // 收集到缓冲区，批量上报
    this._buffer.push(entry)
    if (this._buffer.length >= this._maxBuffer && LOG_ENDPOINT) {
      this._flush()
    }
  },

  async _flush() {
    if (this._flashing || this._buffer.length === 0 || !LOG_ENDPOINT) return
    this._flashing = true
    try {
      await fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: this._buffer.splice(0) }),
      })
    } catch (e) {
      console.warn('Failed to flush logs', e)
    }
    this._flashing = false
  },

  captureError(error) {
    this.error('Uncaught error', error)
  },

  trackEvent(eventName, properties) {
    this.info('Event: ' + eventName, properties)
  },

  // 收集性能指标
  capturePerformance() {
    if (typeof performance === 'undefined') return
    const entries = performance.getEntriesByType('navigation')
    if (entries.length > 0) {
      const nav = entries[0]
      this.info('Page performance', {
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        tcp: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        domReady: domContentLoadedEventEnd,
        load: loadTime,
      })
    }
  },
}

// 全局错误捕获
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => logger.captureError(e.error || e.message))
  window.addEventListener('unhandledrejection', (e) => logger.captureError(e.reason))

  // 页面加载完成后上报性能
  window.addEventListener('load', () => logger.capturePerformance())

  // 页面关闭时上报剩余日志
  window.addEventListener('beforeunload', () => {
    if (logger._buffer.length > 0) {
      navigator.sendBeacon(
        LOG_ENDPOINT,
        JSON.stringify({ logs: logger._buffer.splice(0) })
      )
    }
  })
}
