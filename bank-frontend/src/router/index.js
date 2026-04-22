import Vue from 'vue'
import VueRouter from 'vue-router'
import { getToken } from '@/utils/auth'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue')
  },
  {
    path: '/cards',
    name: 'CardList',
    component: () => import('@/views/card/CardList.vue')
  },
  {
    path: '/cards/:cardId',
    name: 'CardDetail',
    component: () => import('@/views/card/CardDetail.vue')
  },
  {
    path: '/cards/bind',
    name: 'CardBind',
    component: () => import('@/views/card/CardBind.vue')
  },
  {
    path: '/transactions',
    name: 'TransactionList',
    component: () => import('@/views/transaction/TransactionList.vue')
  },
  {
    path: '/transactions/:transId',
    name: 'TransactionDetail',
    component: () => import('@/views/transaction/TransactionDetail.vue')
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import('@/views/transfer/Transfer.vue')
  },
  {
    path: '/transfer/confirm',
    name: 'TransferConfirm',
    component: () => import('@/views/transfer/TransferConfirm.vue')
  },
  {
    path: '/transfer/result',
    name: 'TransferResult',
    component: () => import('@/views/transfer/TransferResult.vue')
  },
  {
    path: '/security',
    name: 'SecurityCenter',
    component: () => import('@/views/security/SecurityCenter.vue')
  },
  {
    path: '/security/trade-password',
    name: 'TradePassword',
    component: () => import('@/views/security/TradePassword.vue')
  },
  {
    path: '/security/limit',
    name: 'LimitSetting',
    component: () => import('@/views/security/LimitSetting.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.public) {
    next()
    return
  }
  if (getToken()) {
    next()
  } else {
    next('/login')
  }
})

export default router
