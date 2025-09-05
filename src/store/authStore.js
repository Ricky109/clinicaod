import { defineStore } from 'pinia'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'), // { CNRODNI, CNOMBRE, CCODALU, CUSUCOD }
    token: localStorage.getItem('auth_token') || null
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
      
      // Guardar en localStorage para persistir la sesión
      localStorage.setItem('auth_user', JSON.stringify(res))
      localStorage.setItem('auth_token', 'mock-token')
      
      return res
    },
    logout() {
      this.user = null
      this.token = null
      
      // Limpiar localStorage
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    }
  }
})
