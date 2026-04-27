import request from '@/utils/request'

export function queryTransactions(data) {
  return request({
    url: '/api/transactions/query',
    method: 'post',
    data
  })
}

export function getTransactionDetail(transId) {
  return request({
    url: '/api/transactions/detail',
    method: 'post',
    data: { transId: transId }
  })
}

export function transfer(data) {
  return request({
    url: '/api/transactions/transfer',
    method: 'post',
    data
  })
}

export function queryPaymentBill(data) {
  return request({
    url: '/api/transactions/payment/query',
    method: 'post',
    data
  })
}

export function payBill(data) {
  return request({
    url: '/api/transactions/payment',
    method: 'post',
    data
  })
}

export function listPaymentAccounts(paymentType) {
  return request({
    url: '/api/transactions/payment/accounts',
    method: 'post',
    data: { paymentType }
  })
}
