import request from '@/utils/request'

export function sendSms(data) {
  return request({
    url: '/api/auth/sms/send',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

export function loginByPassword(data) {
  return request({
    url: '/api/auth/login/password',
    method: 'post',
    data
  })
}

export function loginBySms(data) {
  return request({
    url: '/api/auth/login/sms',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}
