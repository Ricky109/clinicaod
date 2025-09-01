import { defineStore } from 'pinia'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // { CNRODNI, CNOMBRE, CCODALU, CUSUCOD }
    token: null
  }),
  getters: {
    isLogged: (s) => !!s.user
  },
  actions: {
    async login({ CNRODNI, CCLAVE }) {
      const res = await authService.login({ CNRODNI, CCLAVE })
      if (res.ERROR) throw new Error(res.ERROR)
      this.user = res
      this.token = 'mock-token'
      return res
    },
    logout() {
      this.user = null
      this.token = null
    }
  }
})
