import request from '@/utils/request'

export function bindCard(data) {
  return request({
    url: '/api/cards/bind',
    method: 'post',
    data
  })
}

export function unbindCard(cardId, data) {
  return request({
    url: `/api/cards/${cardId}/unbind`,
    method: 'post',
    data
  })
}

export function listCards() {
  return request({
    url: '/api/cards',
    method: 'get'
  })
}

export function getCardDetail(cardId) {
  return request({
    url: `/api/cards/${cardId}`,
    method: 'get'
  })
}

export function setDefaultCard(cardId) {
  return request({
    url: `/api/cards/${cardId}/default`,
    method: 'put'
  })
}

export function queryBalance(cardId) {
  return request({
    url: `/api/cards/${cardId}/balance`,
    method: 'get'
  })
}
