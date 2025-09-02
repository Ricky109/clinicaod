<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import * as pagoService from '../services/pagoService'

const auth = useAuthStore()
const items = ref([])

onMounted(async () => {
  items.value = await pagoService.historial(auth.user?.CNRODNI || '')
})
</script>

<template>
  <div class="card">
    <h2>Historial de Pagos</h2>
    <table style="width:100%; border-collapse: collapse;">
      <thead><tr><th>Paciente</th><th>Código Pago</th><th>Monto</th><th>Estado</th></tr></thead>
      <tbody>
        <tr v-for="it in items" :key="it.codigo">
          <td>{{ it.paciente }}</td>
          <td>{{ it.codigo }}</td>
          <td>S/ {{ it.monto.toFixed(2) }}</td>
          <td>{{ it.estado }}</td>
        </tr>
      </tbody>
    </table>
    <div class="mt-2">
      <router-link class="btn btn-primary btn-SALIR" to="/">SALIR</router-link>
    </div>
  </div>
</template>
