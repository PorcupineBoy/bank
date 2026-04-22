import request from '@/utils/request'

export function getProfile() {
  return request({
    url: '/api/user/profile',
    method: 'get'
  })
}
