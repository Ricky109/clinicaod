<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import * as pagoService from '../services/pagoService'

const auth = useAuthStore()
const items = ref([])

onMounted(async () => {
  // Debug: mostrar información del usuario
  console.log('Usuario autenticado:', auth.user)
  console.log('Código de estudiante:', auth.user?.CCODALU)
  
  // Usar el código de estudiante (CCODALU) del usuario autenticado
  items.value = await pagoService.historial(auth.user?.CCODALU || '')
  console.log('Pagos encontrados:', items.value)
})

function getEstadoIcon(estado) {
  switch (estado.toLowerCase()) {
    case 'pagado':
      return { icon: '✔️', class: 'estado-pagado' }
    case 'pendiente':
      return { icon: '⏳', class: 'estado-pendiente' }
    case 'anulado':
      return { icon: '❌', class: 'estado-anulado' }
    default:
      return { icon: '❔', class: 'estado-desconocido' }
  }
}
</script>

<template>
  <div class="card">
    <h2>HISTORIAL DE PAGOS</h2>

    <div class="historial-container">
      <div v-if="items.length === 0" class="no-pagos">
        <p>NO HAY PAGOS REGISTRADOS PARA ESTE ESTUDIANTE.</p>
        <p>CÓDIGO DE ESTUDIANTE: {{ auth.user?.CCODALU || 'NO DISPONIBLE' }}</p>
      </div>
      <div 
        v-for="it in items" 
        :key="it.codigo" 
        class="historial-card"
      >
        <div class="historial-row">
          <strong>PACIENTE:</strong> <span>{{ it.paciente }}</span>
        </div>
        <div class="historial-row">
          <strong>NÚMERO DE PAGO:</strong> <span>{{ it.codigo }}</span>
        </div>
        <div class="historial-row">
          <strong>MONTO:</strong> <span>S/ {{ it.monto.toFixed(2) }}</span>
        </div>
        <div class="historial-row">
          <strong>ESTADO:</strong>
          <span :class="['estado-icon', getEstadoIcon(it.estado).class]">
            {{ getEstadoIcon(it.estado).icon }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-2" style="text-align:center;">
      <router-link class="btn btn-secondary" to="/home">INICIO</router-link>
    </div>
  </div>
</template>

<style scoped>
.no-pagos {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.no-pagos p {
  margin: 0.5rem 0;
  color: #6c757d;
  font-weight: 500;
}
</style>
