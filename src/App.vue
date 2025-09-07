<template>
  <div class="app-wrapper">
    <!-- Sidebar derecho -->
    <aside v-if="!isLogin && auth.isLogged" :class="['sidebar', { 'sidebar-open': sidebarOpen }]">
      <div class="sidebar-content">
        <div class="sidebar-buttons">
          <router-link class="btn btn-SALIR" to="/home" @click="toggleSidebar">INICIO</router-link>
          <button class="btn btn-SALIR" @click="onLogout">SALIR</button>
        </div>
      </div>
    </aside>

    <!-- Overlay para móviles -->
    <div v-if="!isLogin && auth.isLogged && sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Header -->
    <header v-if="!isLogin" class="header">
      <h1 v-if="auth.isLogged">{{ auth.user?.CNOMBRE || 'USUARIO' }}</h1>
      <h1 v-else>CLÍNICA ODONTOLÓGICA</h1>
      <nav>
        <button v-if="auth.isLogged" class="sidebar-toggle" @click="toggleSidebar">☰</button>
      </nav>
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
