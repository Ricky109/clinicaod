<script setup>
import { usePacienteStore } from '../store/pacienteStore'
const store = usePacienteStore()

async function refrescar() {
  try {
    await store.verificarPago()
  } catch (e) { alert(e.message) }
}
</script>

<template>
  <div class="card">
    <h2>Pago</h2>
    <div v-if="!store.nroPago">
      <p>No hay pago generado. Vuelva a <router-link class="link" to="/atencion">Atención</router-link>.</p>
    </div>
    <div v-else>
      <p><strong>Nro de pago:</strong> {{ store.nroPago }}</p>
      <p><strong>Monto total:</strong> S/ {{ store.montoTotal.toFixed(2) }}</p>
      <p><strong>Estado:</strong>
        <span class="badge" :class="store.estadoPago === 'PAGADO' ? 'badge-ok' : 'badge-pend'">{{ store.estadoPago }}</span>
      </p>

      <div class="mt-2">
        <h3>Pago por Yape (demo)</h3>
        <p>Concepto: <strong>Pago de servicios UCSM</strong></p>
        <p>Escanea el QR (simulado) y luego presiona "Refrescar".</p>
        <div style="width:180px; height:180px; background:#eee; display:flex; align-items:center; justify-content:center; border-radius:10px;">
          <span>QR</span>
        </div>
      </div>

      <div class="mt-2">
        <button class="btn btn-secondary" @click="refrescar">Refrescar</button>
        <router-link class="btn btn-primary btn-SALIR" to="/">SALIR</router-link>
      </div>
    </div>
  </div>
</template>

