<script setup>
import { ref } from 'vue'
import { usePacienteStore } from '../store/pacienteStore'
import { useRouter } from 'vue-router'

const store = usePacienteStore()
const router = useRouter()
const refrescando = ref(false)

async function refrescar() {
  try {
    refrescando.value = true
    await store.verificarPago()
  } catch (e) { 
    alert(e.message) 
  } finally {
    refrescando.value = false
  }
}

function volverAtencion() {
  router.push('/atencion')
}

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
    <h2 style="text-align: center;">PAGO</h2>
    
    <div v-if="!store.nroPago || store.nroPago === null || store.nroPago === ''">
      <div class="no-pago-message">
        <p><strong>NO HAY PAGO GENERADO. VUELVA A ATENCIÓN.</strong></p>
        <button class="btn btn-primary" @click="volverAtencion">
          VOLVER A ATENCIÓN
        </button>
      </div>
    </div>
    <div v-else>
      <p><strong>NRO DE PAGO:</strong> {{ store.nroPago }}</p>
      <p><strong>MONTO TOTAL:</strong> S/ {{ store.montoTotal.toFixed(2) }}</p>
      <p><strong>ESTADO:</strong>
        <span :class="['estado-icon', getEstadoIcon(store.estadoPago).class]">
          {{ getEstadoIcon(store.estadoPago).icon }}
        </span>
        <span class="badge" :class="store.estadoPago === 'PAGADO' ? 'badge-ok' : 'badge-pend'">{{ store.estadoPago }}</span>
      </p>

      <div class="mt-2">
        <h3>PAGO POR YAPE (DEMO)</h3>
        <p>CONCEPTO: <strong>PAGO DE SERVICIOS UCSM</strong></p>
      </div>

      <div class="mt-2" style="text-align:center;">
        <button 
          class="btn btn-secondary" 
          @click="refrescar"
          :disabled="refrescando"
        >
          {{ refrescando ? 'REFRESCANDO...' : 'REFRESCAR' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-pago-message {
  text-align: center;
  padding: 2rem;
  background: #fee2e2;
  border-radius: 8px;
  border: 1px solid #fca5a5;
  margin: 1rem 0;
}

.no-pago-message p {
  color: #b91c1c;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.no-pago-message .btn {
  margin-top: 0.5rem;
}
</style>

