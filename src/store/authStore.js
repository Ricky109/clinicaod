import { defineStore } from 'pinia'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    dniTratante: null
  }),
  getters: {
    isLogged: (s) => !!s.user,
    isAuthenticated: (s) => !!s.user,
    codigoEstudiante: (s) => s.user?.CDNIEST || null
  },
  actions: {
    async login(paData) {
      const res = await authService.login(paData)
      if (res.ERROR) throw new Error(res.ERROR)

      this.user = res
      this.token = 'mock-token'

      this.dniTratante = res.CDNIEST || res.CNRODOC

      return res
    },
    logout() {
      this.user = null
      this.token = null
      this.dniTratante = null
    }
  }
})
