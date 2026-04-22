import request from '@/utils/request'

export function queryTransactions(params) {
  return request({
    url: '/api/transactions',
    method: 'get',
    params
  })
}

export function getTransactionDetail(transId) {
  return request({
    url: `/api/transactions/${transId}`,
    method: 'get'
  })
}

export function transfer(data) {
  return request({
    url: '/api/transactions/transfer',
    method: 'post',
    data
  })
}
