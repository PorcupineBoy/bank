import axios from 'axios'
import { Toast } from 'vant'
import { getToken, removeToken } from './auth'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '',
  timeout: 15000
})

// 请求计数，用于管理并发请求的 loading 状态
let requestCount = 0
let loadingToast = null

function showLoading() {
  if (requestCount === 0) {
    loadingToast = Toast.loading({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
  }
  requestCount++
}

function hideLoading() {
  if (requestCount <= 0) return
  requestCount--
  if (requestCount === 0 && loadingToast) {
    loadingToast.clear()
    loadingToast = null
  }
}

request.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    // 默认显示 loading，可通过 config.loading = false 关闭
    if (config.loading !== false) {
      showLoading()
    }
    return config
  },
  error => {
    hideLoading()
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const config = response.config
    if (config.loading !== false) {
      hideLoading()
    }
    const res = response.data
    if (res.code !== 200) {
      Toast.fail(res.message || 'Error')
      if (res.code === 401) {
        removeToken()
        // 从 VUE_APP_BASE_API 推导前端根路径（生产环境下为 /bank）
        const basePath = (process.env.VUE_APP_BASE_API || '').replace(/\/api$/, '')
        window.location.href = basePath + '/#/login'
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  error => {
    if (error.config && error.config.loading !== false) {
      hideLoading()
    }
    Toast.fail(error.message || 'Network error')
    return Promise.reject(error)
  }
)

export default request
