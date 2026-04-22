import Vue from 'vue'
import Vuex from 'vuex'
import { getToken, setToken, removeToken } from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: getToken(),
    userInfo: JSON.parse(localStorage.getItem('bank_user') || '{}')
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      setToken(token)
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      localStorage.setItem('bank_user', JSON.stringify(userInfo))
    },
    CLEAR_USER(state) {
      state.token = ''
      state.userInfo = {}
      removeToken()
      localStorage.removeItem('bank_user')
    }
  },
  actions: {
    login({ commit }, data) {
      commit('SET_TOKEN', data.token)
      commit('SET_USER_INFO', {
        userId: data.userId,
        phone: data.phone,
        realName: data.realName
      })
    },
    logout({ commit }) {
      commit('CLEAR_USER')
    }
  }
})
