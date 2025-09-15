<template>
  <div class="app-wrapper">
    <div v-if="showUpdate" class="update-toast">Nueva versión disponible, actualizando...</div>
    <!-- Sidebar derecho -->
    <aside v-if="!isLogin && auth.isLogged" :class="['sidebar', { 'sidebar-open': sidebarOpen }]">
      <div class="sidebar-content">
        <div class="sidebar-buttons">
          <router-link class="btn btn-primary btn-buscar" to="/home" @click="toggleSidebar">🏠 Inicio</router-link>
          <button class="btn btn-primary btn-buscar btn-logout" @click="onLogout">🚪 Salir</button>
        </div>
      </div>
    </aside>

    <!-- Overlay para móviles -->
    <div v-if="!isLogin && auth.isLogged && sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Header -->
    <header v-if="!isLogin" class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-container">
            <img src="/src/assets/logoE.png" alt="UCSM Logo" class="logo-img" />
          </div>
          <div class="university-name">
            <span class="university-text">Universidad Católica</span>
            <span class="university-text">de Santa María</span>
          </div>
        </div>
        <nav class="header-right">
          <button v-if="auth.isLogged" class="sidebar-toggle" @click="toggleSidebar">☰</button>
        </nav>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './store/authStore'
import { registerSW } from 'virtual:pwa-register'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isLogin = computed(() => route.path === '/login')
const sidebarOpen = ref(false)
const showUpdate = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function onLogout() {
  auth.logout()
  router.push('/login')
  sidebarOpen.value = false
}

// PWA auto-update notification and reload
onMounted(() => {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        showUpdate.value = true
        setTimeout(() => {
          try { window.location.reload() } catch (_) { location.reload() }
        }, 800)
      },
      onOfflineReady() {
        // opcional: mostrar aviso de offline listo
      }
    })
  } catch (_) {
    // ignorar en entornos sin SW
  }
})
</script>

<style scoped>
.update-toast {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 1000;
}
</style>
