<script setup>
import { ref, computed } from "vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

import tratamientos from "../data/tratamientos.json";
import { usePacienteStore } from "../store/pacienteStore";

const store = usePacienteStore();
const tratamientoSeleccionado = ref(null);

// Opciones adaptadas al multiselect (mostrar nombre + precio pero guardar código)
const opcionesTratamientos = computed(() =>
  tratamientos.map((t) => ({
    label: `${t.CDESCRI} (${t.NPRECIO.toFixed(2)})`,
    value: t.CCODART,
  }))
);

function agregarTratamiento() {
  if (!tratamientoSeleccionado.value) return;
  store.cargarTratamientoPorCodigo(tratamientoSeleccionado.value.value);
  tratamientoSeleccionado.value = null;
}
</script>

<template>
  <div class="card">
    <h2>ATENCIÓN</h2>
    <!-- Botón ATRÁS debajo del título -->
    <div class="mt-2" style="text-align:center;">
      <router-link class="btn btn-SALIR" to="/home">INICIO</router-link>
    </div>

    <div v-if="!store.paciente">
      <p>PRIMERO SELECCIONE UN PACIENTE.</p>
      <router-link class="link" to="/buscar">VOLVER A BUSCAR</router-link>
    </div>

    <div v-else>
      <p>
        <strong>PACIENTE:</strong>
        {{ store.paciente.CNOMBRE || store.paciente.CNRODNI }}
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
            placeholder="BUSCAR O SELECCIONAR..."
            label="label"
            track-by="value"
            :searchable="true"
            :close-on-select="true"
            :clear-on-select="true"
            @select="agregarTratamiento"
            class="multiselect-custom"
          />
        </div>
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
            <strong>{{ it.CDESCRI }}</strong>
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
          <router-link
            class="btn btn-SALIR"
            to="/pago"
            @click.prevent="
              $router.push('/pago');
              store.grabarConsumo().catch((e) => alert(e.message));
            "
          >
            GRABAR
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper para contener el multiselect sin desbordes */
.multiselect-wrapper {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Forzar que el multiselect se ajuste al contenedor */
.multiselect-custom,
.multiselect,
.multiselect__input,
.multiselect__tags {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box;
}
</style>
