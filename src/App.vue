<template>
  <header class="header">
    <h1 v-if="!isLogin && auth.isLogged">{{ auth.user?.CNOMBRE || 'USUARIO' }}</h1>
    <h1 v-if="!isLogin && !auth.isLogged">CLÍNICA ODONTOLÓGICA</h1>
    <nav>
      <button v-if="!isLogin && auth.isLogged" class="btn btn-SALIR" @click="onLogout">LOGOUT</button>
    </nav>
  </header>
  <main class="container">
    <router-view />
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './store/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isLogin = computed(() => route.path === '/login')

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>
