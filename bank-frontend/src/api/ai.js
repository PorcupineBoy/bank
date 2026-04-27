import request from '@/utils/request'

export function sendChatMessage(data) {
  return request({
    url: '/api/ai/chat/send',
    method: 'post',
    data
  })
}

export function getChatHistory(data) {
  return request({
    url: '/api/ai/chat/history',
    method: 'post',
    data
  })
}

export function newChatSession(data) {
  return request({
    url: '/api/ai/chat/session',
    method: 'post',
    data
  })
}

export function getConsumptionAnalysis(data) {
  return request({
    url: '/api/ai/consumption/analysis',
    method: 'post',
    data
  })
}
