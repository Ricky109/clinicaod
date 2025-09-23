<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import * as pagoService from '../services/pagoService'

const auth = useAuthStore()
const items = ref([])
const cargando = ref(false)
const error = ref('')
const descargando = ref({})

// Variables para filtros de fecha
const filtroDesde = ref('')
const filtroHasta = ref('')

onMounted(async () => {
  // Establecer fecha por defecto (fecha actual)
  const fechaActual = new Date()
  const hoy = fechaActual.toISOString().split('T')[0]
  filtroDesde.value = hoy
  filtroHasta.value = hoy
  await cargarHistorialPacientes()
})

async function cargarHistorialPacientes() {
  try {
    cargando.value = true
    error.value = ''
    
    // Obtener el DNI del estudiante logueado para buscar sus pagos generados
    // La API COD1021 busca por el DNI del estudiante que generó los pagos
    const dniEstudiante = auth.user?.CDNIEST
    
    if (!dniEstudiante) {
      error.value = 'No se encontró el DNI del estudiante'
      return
    }
    
    console.log('Usuario autenticado completo:', auth.user)
    console.log('CDNIEST (DNI del estudiante):', auth.user?.CDNIEST)
    console.log('DNI del estudiante para historial:', dniEstudiante)

    const inicio = filtroDesde.value
    const fin = filtroHasta.value || filtroDesde.value

    // Validación de rango
    if (inicio && fin && new Date(inicio) > new Date(fin)) {
      error.value = 'La fecha de inicio no puede ser posterior a la fecha final.'
      return
    }

    // Llamada única con rango
    const historialData = await pagoService.historialPacientesAtendidos(dniEstudiante, inicio, fin)
    
    // Asignar directamente los datos de la API sin persistir
    items.value = historialData
    console.log('Pacientes atendidos encontrados:', items.value)
    
  } catch (e) {
    error.value = 'FALLÓ LA CONEXIÓN'
    console.error('Error:', e)
  } finally {
    cargando.value = false
  }
}

// Función para buscar con filtros de fecha (rango de fechas)
async function buscarConFiltros() {
  try {
    cargando.value = true
    error.value = ''
    
    // Obtener el DNI del estudiante logueado
    const dniEstudiante = auth.user?.CDNIEST
    
    if (!dniEstudiante) {
      error.value = 'No se encontró el DNI del estudiante'
      return
    }
    
    const inicio = filtroDesde.value
    const fin = filtroHasta.value || filtroDesde.value
    
    // Validación de rango
    if (inicio && fin && new Date(inicio) > new Date(fin)) {
      error.value = 'LA FECHA DE INICIO NO PUEDE SER POSTERIOR A LA FECHA FINAL.'
      return
    }

    // Llamada única con rango
    const historialData = await pagoService.historialPacientesAtendidos(dniEstudiante, inicio, fin)
    items.value = historialData
    console.log('Total de pacientes encontrados:', items.value.length)
    
  } catch (e) {
    error.value = e.message || 'Error al cargar el historial de pacientes'
    console.error('Error:', e)
  } finally {
    cargando.value = false
  }
}

// Ya no se requiere generar rango por día ni eliminar duplicados

// Función para limpiar filtros y mostrar fecha actual
async function limpiarFiltros() {
  // Limpiar los inputs de fecha
  filtroDesde.value = ''
  filtroHasta.value = ''
  
  // Limpiar la lista de pacientes
  items.value = []
}

function getEstadoIcon(estado) {
  switch (estado) {
    case 'C': // PAGADO
      return { icon: '✔️', class: 'estado-pagado', texto: 'PAGADO' }
    case 'A': // PENDIENTE DE PAGO
      return { icon: '⏳', class: 'estado-pendiente', texto: 'PENDIENTE DE PAGO' }
    case 'X': // ANULADO
      return { icon: '❌', class: 'estado-anulado', texto: 'ANULADO' }
    case 'F': // FACTURADO
      return { icon: '📄', class: 'estado-facturado', texto: 'FACTURADO' }
    default:
      return { icon: '❔', class: 'estado-desconocido', texto: 'DESCONOCIDO' }
  }
}

//DESCARGAR BOLETA
async function descargarDetalles(item) {
  try {
    descargando.value = { ...descargando.value, [item.codigo]: true }
    error.value = ''

    // Construir la URL real
    const url = `https://transacciones.ucsm.edu.pe//FILES/TMP/${item.cboleta}`

    // Abrir en nueva pestaña (se mostrará el PDF directamente)
    window.open(url, '_blank')

  } catch (e) {
    console.error('Error al abrir boleta:', e)
    error.value = 'No se pudo abrir la boleta. Intenta nuevamente.'
  } finally {
    descargando.value = { ...descargando.value, [item.codigo]: false }
  }
}





function formatearFecha(fecha) {
  if (!fecha) return 'No disponible'
  
  try {
    // La API devuelve formato: '2025-09-10 03:09'
    const fechaObj = new Date(fecha)
    
    // Verificar si la fecha es válida
    if (isNaN(fechaObj.getTime())) {
      return fecha // Devolver la fecha original si no se puede parsear
    }
    
    // Formato: Año, Mes, Día (YYYY-MM-DD)
    const año = fechaObj.getFullYear()
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
    const dia = String(fechaObj.getDate()).padStart(2, '0')
    return `${año}-${mes}-${dia}`
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return fecha // Devolver la fecha original en caso de error
  }
}
</script>

<template>
  <div class="card">
    <h2 style="text-align: center;">HISTORIAL DE PACIENTES ATENDIDOS</h2>

    <!-- Sección de filtros de fecha -->
    <div class="filtros-container">
      <div class="filtros-row">
        <div class="filtro-item">
          <label for="filtroDesde" class="filtro-label">Desde:</label>
          <input 
            id="filtroDesde"
            v-model="filtroDesde" 
            type="date" 
            class="filtro-input"
          />
        </div>
        <div class="filtro-item">
          <label for="filtroHasta" class="filtro-label">Hasta:</label>
          <input 
            id="filtroHasta"
            v-model="filtroHasta" 
            type="date" 
            class="filtro-input"
          />
        </div>
        <div class="filtro-buttons">
          <button 
            @click="buscarConFiltros" 
            class="btn btn-primary btn-buscar"
            :disabled="cargando"
          >
            🔍 Buscar
          </button>
          <button 
            @click="limpiarFiltros" 
            class="btn btn-secondary btn-limpiar"
            :disabled="cargando"
          >
            🧹 Limpiar
          </button>
        </div>
      </div>
    </div>

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
        <p>NO HAY PACIENTES ATENDIDOS EN ESTA FECHA</p>
        <p>DNI DEL ESTUDIANTE: {{ auth.user?.CDNIEST || 'NO DISPONIBLE' }}</p>
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
          <strong>DNI:</strong> <span>{{ it.dni }}</span>
        </div>
        <div class="historial-row">
          <strong>NÚMERO DE PAGO:</strong> <span>{{ it.codigo }}</span>
        </div>
        <div class="historial-row">
          <strong>MONTO:</strong> <span>S/ {{ it.monto.toFixed(2) }}</span>
        </div>
        <div class="historial-row">
          <strong>ESTADO:</strong>
          <div class="estado-container">
            <span :class="['estado-icon', getEstadoIcon(it.estado).class]">
              {{ getEstadoIcon(it.estado).icon }}
            </span>
            <span class="estado-texto">{{ getEstadoIcon(it.estado).texto }}</span>
            <button 
              v-if="it.estado === 'F'" 
              class="btn-descargar"
              @click="descargarDetalles(it)"
              title="Descargar detalles del pago facturado"
            >
              <span v-if="descargando[it.codigo]">⏳</span>
              <span v-else>💾</span>
            </button>
          </div>
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

/* Hacer que los valores (span) se vean en texto normal */
.historial-row span {
  font-weight: normal;
  color: #333;
  font-family: 'CocogooseCompressed', sans-serif;
  font-weight: 300;
}

.estado-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.estado-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.estado-texto {
  font-weight: 500;
  font-size: 0.9rem;
}

.estado-pagado { color: green; }
.estado-pendiente { color: orange; }
.estado-anulado { color: red; }
.estado-facturado { color: #3b82f6; }
.estado-desconocido { color: gray; }

.btn-descargar {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-descargar:hover {
  background: #2563eb;
}

/* Estilos para alinear perfectamente los botones BUSCAR y LIMPIAR */
.filtro-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filtro-buttons .btn-buscar,
.filtro-buttons .btn-limpiar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
  margin: 0;
  padding: 12px 20px;
  box-sizing: border-box;
  line-height: 1;
}

/* Eliminar cualquier transform que pueda causar desalineación */
.filtro-buttons .btn-buscar:hover,
.filtro-buttons .btn-limpiar:hover {
  transform: none;
}
</style>
