<script setup>
import { ref } from 'vue'
import { usePacienteStore } from '../store/pacienteStore'
import { useRouter } from 'vue-router'

const store = usePacienteStore()
const router = useRouter()
const refrescando = ref(false)
const mostrarToast = ref(false)

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

async function copiarNumeroPago() {
  try {
    await navigator.clipboard.writeText(store.nroPago.toString())
    mostrarToast.value = true
    setTimeout(() => {
      mostrarToast.value = false
    }, 3000)
  } catch (err) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = store.nroPago.toString()
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    mostrarToast.value = true
    setTimeout(() => {
      mostrarToast.value = false
    }, 3000)
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
      <div class="nro-pago-container">
        <p><strong>NRO DE PAGO:</strong> {{ store.nroPago }}</p>
        <button 
          class="btn btn-copy" 
          @click="copiarNumeroPago"
          title="Copiar número de pago"
        >
          📋 COPIAR NRO
        </button>
      </div>
      <p><strong>MONTO TOTAL:</strong> S/ {{ store.montoTotal.toFixed(2) }}</p>
      <p><strong>ESTADO:</strong>
        <span :class="['estado-icon', getEstadoIcon(store.estadoPago).class]">
          {{ getEstadoIcon(store.estadoPago).icon }}
        </span>
        <span class="badge" :class="store.estadoPago === 'PAGADO' ? 'badge-ok' : 'badge-pend'">{{ store.estadoPago }}</span>
      </p>

      <div class="mt-2">
        <h3>YAPE: CATÓLICA DE SANTA MARÍA DE AREQUIPA PENSIONES</h3>
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

    <!-- Toast de confirmación -->
    <div v-if="mostrarToast" class="toast">
      Nro de pago copiado
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

/* Estilos para el contenedor del número de pago */
.nro-pago-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px 0;
  width: 100%;
}

.nro-pago-container p {
  margin: 0;
  flex: 1;
  font-size: 16px;
  text-align: left;
}

/* Botón de copiar */
.btn-copy {
  background: rgba(5, 190, 106, 0.1);
  border: 2px solid rgba(5, 190, 106, 0.3);
  color: #05be6a;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 32px;
  flex-shrink: 0;
}

.btn-copy:hover {
  background: rgba(5, 190, 106, 0.2);
  border-color: rgba(5, 190, 106, 0.5);
  transform: translateY(-1px);
}

/* Toast de confirmación */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .nro-pago-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 0;
  }
  
  .nro-pago-container p {
    text-align: left;
    font-size: 14px;
    flex: 1;
    margin-right: 8px;
  }
  
  .btn-copy {
    font-size: 11px;
    padding: 5px 8px;
    min-height: 28px;
    flex-shrink: 0;
  }
  
  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    text-align: center;
  }
}
</style>

