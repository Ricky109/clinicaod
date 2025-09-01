<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ CNRODNI: '', CCLAVE: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  try {
    loading.value = true
    await auth.login(form.value)
    router.push('/buscar')
  } catch (e) {
    error.value = e.message || 'Error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card" style="max-width:420px;margin:24px auto;">
    <h2>Iniciar Sesión</h2>
    <input class="input" placeholder="DNI" v-model="form.CNRODNI" />
    <input class="input" placeholder="Clave" v-model="form.CCLAVE" type="password" />
    <button class="btn btn-primary mt-2" @click="submit" :disabled="loading">Acceder</button>
    <p v-if="error" style="color:#b91c1c" class="mt-1">{{ error }}</p>
    <p class="mt-2" style="font-size:12px;color:#555">Demo: usa cualquier DNI para ingresar.</p>
  </div>
</template>
