import axios from 'axios'
import { Toast } from 'vant'
import { getToken, removeToken } from './auth'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '',
  timeout: 15000
})

request.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      Toast.fail(res.message || 'Error')
      if (res.code === 401) {
        removeToken()
        window.location.href = '/#/login'
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  error => {
    Toast.fail(error.message || 'Network error')
    return Promise.reject(error)
  }
)

export default request
