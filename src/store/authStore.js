import { defineStore } from 'pinia'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, 
    token: null
  }),
  getters: {
    isLogged: (s) => !!s.user
  },
  actions: {
    async login(paData) {
      const res = await authService.login(paData)
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
