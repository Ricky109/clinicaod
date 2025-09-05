<template>
  <header v-if="!isLogin" class="header">
    <h1 v-if="auth.isLogged">{{ auth.user?.CNOMBRE || 'USUARIO' }}</h1>
    <h1 v-else>CLÍNICA ODONTOLÓGICA</h1>
    <nav>
      <button v-if="auth.isLogged" class="btn btn-SALIR" @click="onLogout">LOGOUT</button>
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
