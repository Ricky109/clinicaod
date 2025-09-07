<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import * as pagoService from '../services/pagoService'

const auth = useAuthStore()
const items = ref([])
const cargando = ref(false)
const error = ref('')

onMounted(async () => {
  await cargarHistorialPacientes()
})

async function cargarHistorialPacientes() {
  try {
    cargando.value = true
    error.value = ''
    
    // Obtener el código de estudiante del usuario autenticado
    // Usar CDNIALU como identificador principal (devuelto por la API de login)
    const codigoEstudiante = auth.codigoEstudiante
    
    if (!codigoEstudiante) {
      error.value = 'No se encontró el código de estudiante'
      return
    }
    
    console.log('Usuario autenticado completo:', auth.user)
    console.log('CDNIALU (identificador principal):', auth.user?.CDNIALU)
    console.log('CCODALU (alternativo):', auth.user?.CCODALU)
    console.log('Código de estudiante seleccionado:', codigoEstudiante)
    
    // Llamar a la API COD1021
    items.value = await pagoService.historialPacientesAtendidos(codigoEstudiante)
    console.log('Pacientes atendidos encontrados:', items.value)
    
  } catch (e) {
    error.value = e.message || 'Error al cargar el historial de pacientes'
    console.error('Error:', e)
  } finally {
    cargando.value = false
  }
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

function formatearFecha(fecha) {
  if (!fecha) return 'No disponible'
  const fechaObj = new Date(fecha)
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="card">
    <h2 style="text-align: center;">HISTORIAL DE PACIENTES ATENDIDOS</h2>

    <!-- Indicador de carga -->
    <div v-if="cargando" class="cargando">
      <p>Cargando historial de pacientes...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Lista de pacientes -->
    <div v-else class="historial-container">
      <div v-if="items.length === 0" class="no-pacientes">
        <p>NO HAY PACIENTES ATENDIDOS POR ESTE ESTUDIANTE</p>
        <p>CÓDIGO DE ESTUDIANTE: {{ auth.codigoEstudiante || 'NO DISPONIBLE' }}</p>
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
        <div class="historial-row">
          <strong>FECHA:</strong> <span>{{ formatearFecha(it.fecha) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cargando {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.error-message {
  color: #b91c1c;
  background-color: #fee2e2;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #b91c1c;
  margin: 16px 0;
  font-weight: 500;
}

.no-pacientes {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.no-pacientes p {
  margin: 0.5rem 0;
  color: #6c757d;
  font-weight: 500;
}

/* Mantener estilos existentes del historial de pagos */
.historial-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.historial-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.historial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.historial-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.historial-row strong {
  font-weight: 600;
  margin-right: 0.5rem;
}

.estado-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.estado-pagado { color: green; }
.estado-pendiente { color: orange; }
.estado-anulado { color: red; }
.estado-desconocido { color: gray; }
</style>
