<template>
  <div class="app-wrapper">
    <!-- Sidebar derecho -->
    <aside v-if="!isLogin && auth.isLogged" :class="['sidebar', { 'sidebar-open': sidebarOpen }]">
      <div class="sidebar-content">
        <div class="sidebar-buttons">
          <router-link class="btn btn-SALIR" to="/home" @click="toggleSidebar">INICIO</router-link>
          <button class="btn btn-SALIR btn-logout" @click="onLogout">SALIR</button>
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
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './store/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isLogin = computed(() => route.path === '/login')
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function onLogout() {
  auth.logout()
  router.push('/login')
  sidebarOpen.value = false
}
</script>
