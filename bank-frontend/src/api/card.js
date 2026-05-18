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
    url: '/api/cards/list',
    method: 'post',
    data: {}
  })
}

export function getCardDetail(cardId) {
  return request({
    url: '/api/cards/detail',
    method: 'post',
    data: { cardId }
  })
}

export function setDefaultCard(cardId) {
  return request({
    url: '/api/cards/default',
    method: 'post',
    data: { cardId }
  })
}

export function queryBalance(cardId) {
  return request({
    url: '/api/cards/balance',
    method: 'post',
    data: { cardId }
  })
}

/**
 * 根据收款人姓名模糊查找银行卡（用于转账时自动填充）
 */
export function lookupCardsByName(name) {
  return request({
    url: '/api/cards/lookup-by-name',
    method: 'post',
    data: { name }
  })
}
