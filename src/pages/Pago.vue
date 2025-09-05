<script setup>
import { usePacienteStore } from '../store/pacienteStore'
const store = usePacienteStore()

async function refrescar() {
  try {
    await store.verificarPago()
  } catch (e) { alert(e.message) }
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
    <h2>PAGO</h2>
    
    <!-- Botón INICIO debajo del título -->
    <div class="mt-2" style="text-align:center;">
      <router-link class="btn btn-SALIR" to="/home">INICIO</router-link>
    </div>
    
    <div v-if="!store.nroPago">
      <p>NO HAY PAGO GENERADO. VUELVA A <router-link class="link" to="/atencion">ATENCIÓN</router-link>.</p>
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
        <button class="btn btn-secondary" @click="refrescar">REFRESCAR</button>
      </div>
    </div>
  </div>
</template>

