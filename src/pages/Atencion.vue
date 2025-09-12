<script setup>
import { ref } from "vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

import { usePacienteStore } from "../store/pacienteStore";
import { useAuthStore } from "../store/authStore";

const store = usePacienteStore();
const authStore = useAuthStore();
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

async function grabarYIrAPago() {  // ← Cambia el nombre
  try {
    await store.grabarConsumo();
    // Redirigir a PAGO en lugar de HISTORIAL
    window.location.href = '/pago';  // ← Cambia la ruta
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
      <router-link class="link" to="/buscar">VOLVER A BUSCAR</router-link>
    </div>

    <div v-else>
      <p>
        <strong>PACIENTE:</strong>
        {{
          store.paciente.CAPEPAT && store.paciente.CAPEMAT && store.paciente.CNOMBRE
            ? `${store.paciente.CAPEPAT}, ${store.paciente.CAPEMAT}, ${store.paciente.CNOMBRE}`
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
      <div class="mt-2 flex justify-between items-center flex-wrap gap-2">
        <p>
          <strong>MONTO TOTAL:</strong>
          S/ {{ store.montoTotal.toFixed(2) }}
        </p>
        <div class="flex gap-2">
          <button
            class="btn btn-SALIR"
            @click="grabarYIrAPago"
          >
            GRABAR
          </button>
        </div>
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
</style>
