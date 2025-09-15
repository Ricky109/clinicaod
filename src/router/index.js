import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/home', component: () => import('../pages/Home.vue'), meta: { auth: true } },
  { path: '/buscar', component: () => import('../pages/BuscarPaciente.vue'), meta: { auth: true } },
  { path: '/atencion', component: () => import('../pages/Atencion.vue'), meta: { auth: true } },
  { path: '/pago', component: () => import('../pages/Pago.vue'), meta: { auth: true } },
  { path: '/historial', component: () => import('../pages/Historial.vue'), meta: { auth: true } },
  { path: '/:pathMatch(.*)', component: () => import('../pages/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  // Si ya está autenticado y va a /login, redirigir al home existente
  if (to.path === '/login' && auth.isAuthenticated) return next('/home')
  if (to.meta.auth && !auth.isAuthenticated) return next('/login')
  next()
})

export default router
