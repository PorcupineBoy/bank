import request from '@/utils/request'

export function setTradePassword(data) {
  return request({
    url: '/api/user/security/trade-password',
    method: 'post',
    data
  })
}

export function modifyTradePassword(data) {
  return request({
    url: '/api/user/security/trade-password',
    method: 'put',
    data
  })
}

export function getLimits() {
  return request({
    url: '/api/user/security/limits',
    method: 'get'
  })
}

export function updateLimits(data) {
  return request({
    url: '/api/user/security/limits',
    method: 'put',
    data
  })
}
