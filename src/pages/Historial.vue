<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import * as pagoService from '../services/pagoService'

const auth = useAuthStore()
const items = ref([])
const cargando = ref(false)
const error = ref('')

// Variables para filtros de fecha
const filtroDesde = ref('')
const filtroHasta = ref('')

onMounted(async () => {
  // Establecer fecha por defecto (fecha actual)
  const fechaActual = new Date()
  filtroDesde.value = fechaActual.toISOString().split('T')[0]
  
  await cargarHistorialPacientes()
})

async function cargarHistorialPacientes(fechaEspecifica = null) {
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
    
    let fechaParaAPI = null
    
    if (fechaEspecifica) {
      // Si se especifica una fecha (como "2000-01-01" para mostrar todo)
      fechaParaAPI = fechaEspecifica
    } else if (filtroDesde.value && filtroHasta.value) {
      // Si hay rango de fechas, usar la fecha desde
      fechaParaAPI = filtroDesde.value
    } else if (filtroDesde.value) {
      // Si solo hay fecha desde, usar esa
      fechaParaAPI = filtroDesde.value
    } else {
      // Por defecto, usar fecha actual
      const fechaActual = new Date()
      fechaParaAPI = fechaActual.toISOString().split('T')[0]
    }
    
    console.log('Fecha para API:', fechaParaAPI)
    
    // Llamar a la API COD1021 con la fecha específica
    const historialData = await pagoService.historialPacientesAtendidos(dniEstudiante, fechaParaAPI)
    
    // Asignar directamente los datos de la API sin persistir
    items.value = historialData
    console.log('Pacientes atendidos encontrados:', items.value)
    
  } catch (e) {
    error.value = e.message || 'Error al cargar el historial de pacientes'
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
    
    let fechasParaConsultar = []
    
    if (filtroDesde.value && filtroHasta.value) {
      // Si hay rango de fechas, generar todas las fechas entre desde y hasta
      fechasParaConsultar = generarRangoFechas(filtroDesde.value, filtroHasta.value)
    } else if (filtroDesde.value) {
      // Si solo hay fecha desde, usar esa fecha
      fechasParaConsultar = [filtroDesde.value]
    } else {
      // Por defecto, usar fecha actual
      const fechaActual = new Date()
      fechasParaConsultar = [fechaActual.toISOString().split('T')[0]]
    }
    
    console.log('Fechas a consultar:', fechasParaConsultar)
    
    // Hacer peticiones para cada fecha y combinar resultados
    const todosLosResultados = []
    
    for (const fecha of fechasParaConsultar) {
      try {
        console.log(`Consultando fecha: ${fecha}`)
        const historialData = await pagoService.historialPacientesAtendidos(dniEstudiante, fecha)
        if (historialData && historialData.length > 0) {
          todosLosResultados.push(...historialData)
        }
      } catch (error) {
        console.warn(`Error consultando fecha ${fecha}:`, error)
        // Continuar con las demás fechas aunque una falle
      }
    }
    
    // Eliminar duplicados basándose en el código de pago
    const resultadosUnicos = eliminarDuplicados(todosLosResultados)
    
    items.value = resultadosUnicos
    console.log('Total de pacientes encontrados:', items.value.length)
    
  } catch (e) {
    error.value = e.message || 'Error al cargar el historial de pacientes'
    console.error('Error:', e)
  } finally {
    cargando.value = false
  }
}

// Función para generar rango de fechas entre dos fechas
function generarRangoFechas(fechaInicio, fechaFin) {
  const fechas = []
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  
  // Asegurar que la fecha de inicio no sea mayor que la de fin
  if (inicio > fin) {
    [inicio, fin] = [fin, inicio]
  }
  
  const fechaActual = new Date(inicio)
  
  while (fechaActual <= fin) {
    fechas.push(fechaActual.toISOString().split('T')[0])
    fechaActual.setDate(fechaActual.getDate() + 1)
  }
  
  return fechas
}

// Función para eliminar duplicados basándose en el código de pago
function eliminarDuplicados(resultados) {
  const unicos = new Map()
  
  resultados.forEach(item => {
    const clave = item.codigo || item.CNROPAG
    if (clave && !unicos.has(clave)) {
      unicos.set(clave, item)
    }
  })
  
  return Array.from(unicos.values())
}

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

function descargarDetalles(codigoPago) {
  // Aquí se implementaría la lógica para descargar los detalles del pago facturado
  // Por ahora, simulamos la descarga
  const url = `https://transacciones.ucsm.edu.pe/descargas/${codigoPago}.pdf`
  window.open(url, '_blank')
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
              @click="descargarDetalles(it.codigo)"
              title="Descargar detalles del pago facturado"
            >
              📥 DESCARGAR
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
</style>
