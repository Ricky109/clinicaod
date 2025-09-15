<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

import { usePacienteStore } from "../store/pacienteStore";
import { useAuthStore } from "../store/authStore";

const store = usePacienteStore();
const authStore = useAuthStore();
const router = useRouter();
const tratamientoSeleccionado = ref(null);
const buscandoTratamientos = ref(false);
const errorBusqueda = ref("");
const opcionesTratamientos = ref([]);

// Función para buscar tratamientos
async function buscarTratamientos(termino) {
  if (!termino || termino.length < 4) {
    opcionesTratamientos.value = [];
    return;
  }

  buscandoTratamientos.value = true;
  errorBusqueda.value = "";

  try {
    const tratamientosEncontrados = await store.buscarTratamientosStore(
      termino,
      authStore.codigoEstudiante
    );
    if (termino && termino.length >= 4) {
      opcionesTratamientos.value = tratamientosEncontrados.map((t) => ({
        label: `${t.CDESCRI} (S/ ${t.NPRECIO.toFixed(2)})`,
        value: t.CCODART,
        CDESCRI: t.CDESCRI,
        NPRECIO: t.NPRECIO,
      }));
    } else {
      opcionesTratamientos.value = [];
    }
  } catch (error) {
    errorBusqueda.value = "No se encontraron tratamientos";
    opcionesTratamientos.value = [];
  } finally {
    buscandoTratamientos.value = false;
  }
}

function agregarTratamiento() {
  if (!tratamientoSeleccionado.value) return;
  
  // Crear el objeto tratamiento con los datos del multiselect
  const tratamiento = {
    CCODART: tratamientoSeleccionado.value.value,
    CDESCRI: tratamientoSeleccionado.value.CDESCRI,
    NPRECIO: tratamientoSeleccionado.value.NPRECIO,
    NCANTID: 1
  };
  
  // Agregar directamente al store
  store.agregarTratamiento(tratamiento);
  
  // Limpiar selección
  tratamientoSeleccionado.value = null;
  opcionesTratamientos.value = [];
}

async function grabarYIrAPago() {
  try {
    // Llamar al método del store que envía los tratamientos a la API
    const respuesta = await store.grabarConsumo();
    
    // La respuesta de la API contiene NROPAGO y ESTADO
    console.log('Respuesta de la API:', respuesta);
    
    // Navegar a /pago usando router.push
    router.push('/pago');
  } catch (e) {
    alert(e.message);
  }
}
</script>

<template>
  <div class="card">
    <h2 style="text-align: center">ATENCIÓN</h2>

    <div v-if="!store.paciente">
      <p>PRIMERO SELECCIONE UN PACIENTE.</p>
      <router-link class="link" to="/buscar">VOLVER A BUSCAR/REGISTRAR PACIENTE</router-link>
    </div>

    <div v-else>
      <p>
        <strong>PACIENTE:</strong>
        {{
          store.paciente.CAPEPAT && store.paciente.CAPEMAT && store.paciente.CNOMBRE
            ? `${store.paciente.CAPEPAT} ${store.paciente.CAPEMAT}, ${store.paciente.CNOMBRE}`
            : (store.paciente.CNOMBRE || store.paciente.CNRODNI)
        }}
      </p>

      <!-- Menú desplegable con buscador -->
      <div class="mt-2">
        <label for="tratamiento" class="block mb-1">
          SELECCIONAR TRATAMIENTO:
        </label>
        <div class="multiselect-wrapper">
          <Multiselect
            v-model="tratamientoSeleccionado"
            :options="opcionesTratamientos"
            placeholder="ESCRIBA PARA BUSCAR (mín. 4 caracteres)..."
            label="label"
            track-by="value"
            :searchable="true"
            :close-on-select="true"
            :clear-on-select="true"
            :loading="buscandoTratamientos"
            @search-change="buscarTratamientos"
            @select="agregarTratamiento"
            class="multiselect-custom"
          />
        </div>
        <p v-if="buscandoTratamientos" style="color: #666; font-size: 12px">
          Buscando tratamientos...
        </p>
        <p v-if="errorBusqueda" style="color: #b91c1c; font-size: 12px">
          {{ errorBusqueda }}
        </p>
      </div>

      <!-- Tratamientos seleccionados -->
      <h3 class="mt-2">SELECCIONADOS</h3>
      <div v-if="store.tratamientos.length === 0">
        NO HAY TRATAMIENTOS SELECCIONADOS.
      </div>
      <div v-else class="tratamientos-container">
        <div
          v-for="it in store.tratamientos"
          :key="it.CCODART"
          class="tratamiento-card"
        >
          <div class="tratamiento-header">
            <!-- Aquí aplicamos la clase para textos largos -->
            <strong class="tratamiento-descripcion">{{ it.CDESCRI }}</strong>
            <button
              class="btn btn-secondary btn-sm"
              @click="store.quitarTratamiento(it.CCODART)"
            >
              ✕
            </button>
          </div>

          <div class="tratamiento-body">
            <div>
              <label>CANT.:</label>
              <input
                class="input"
                type="number"
                min="1"
                :value="it.NCANTID"
                @input="
                  store.actualizarCantidad(it.CCODART, $event.target.value)
                "
              />
            </div>
            <div>
              <label>PRECIO:</label>
              <span>S/ {{ it.NPRECIO.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="mt-2 flex justify-between items-stretch gap-2">
        <div class="monto-total-container">
          <p class="monto-total-label">MONTO TOTAL:</p>
          <p class="monto-total-value">S/ {{ store.montoTotal.toFixed(2) }}</p>
        </div>
        <button
          class="btn btn-primary btn-grabar-full"
          @click="grabarYIrAPago"
        >
          💾 Grabar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ajuste para el multiselect */
.multiselect-wrapper {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.multiselect-custom,
.multiselect,
.multiselect__input,
.multiselect__tags {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box;
}

/* Reducir tamaño de fuente en los items del multiselect */
.multiselect__tags {
  font-size: 13px !important;
  min-height: 40px !important;
}

.multiselect__tag {
  font-size: 12px !important;
  padding: 4px 8px !important;
  margin: 2px 4px 2px 0 !important;
  line-height: 1.2 !important;
}

.multiselect__tag-icon {
  font-size: 12px !important;
  line-height: 1.2 !important;
}

.multiselect__input {
  font-size: 13px !important;
  padding: 8px 10px !important;
}

.multiselect__placeholder {
  font-size: 13px !important;
  padding: 8px 10px !important;
}

/* Items en el dropdown */
.multiselect__option {
  font-size: 13px !important;
  padding: 8px 12px !important;
  line-height: 1.3 !important;
}

.multiselect__option--highlight {
  font-size: 13px !important;
}

/* Nueva clase para textos largos */
.tratamiento-descripcion {
  display: block;
  max-height: 80px; /* altura máxima visible */
  overflow-y: auto; /* scroll si se excede */
  white-space: pre-wrap; /* respeta saltos de línea */
  word-wrap: break-word; /* corta palabras largas */
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Estilos para el monto total - similar al botón GRABAR pero en verde */
.monto-total-container {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
  text-align: center;
  min-width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

/* Botón GRABAR con las mismas dimensiones que el MONTO TOTAL */
.btn-grabar-full {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 2px solid #34d399;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
  color: white;
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  flex: 1;
  transition: all 0.3s ease;
}

.btn-grabar-full:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.monto-total-label {
  color: #166534;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.monto-total-value {
  color: #15803d;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .monto-total-container {
    min-width: 100%;
    margin-bottom: 16px;
  }
  
  .monto-total-value {
    font-size: 20px;
  }
  
  /* En móviles, apilar verticalmente */
  .mt-2.flex {
    flex-direction: column;
  }
  
  .btn-grabar-full {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
