import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/buscar', component: () => import('../pages/BuscarPaciente.vue'), meta: { auth: true } },
  { path: '/atencion', component: () => import('../pages/Atencion.vue'), meta: { auth: true } },
  { path: '/pago', component: () => import('../pages/Pago.vue'), meta: { auth: true } },
  { path: '/historial', component: () => import('../pages/Historial.vue'), meta: { auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isLogged) return next('/login')
  next()
})

export default router
