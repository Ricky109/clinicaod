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
    label: `${t.CDESCRI} (S/ ${t.NPRECIO.toFixed(2)})`,
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
    <h2>Atención</h2>

    <div v-if="!store.paciente">
      <p>Primero seleccione un paciente.</p>
      <router-link class="link" to="/buscar">Volver a Buscar</router-link>
    </div>

    <div v-else>
      <p>
        <strong>Paciente:</strong>
        {{ store.paciente.CNOMBRE || store.paciente.CNRODNI }}
      </p>

      <!-- Menú desplegable con buscador -->
      <div class="mt-2">
        <label for="tratamiento" class="block mb-1">
          Seleccionar tratamiento:
        </label>
        <div class="multiselect-wrapper">
          <Multiselect
            v-model="tratamientoSeleccionado"
            :options="opcionesTratamientos"
            placeholder="Buscar o seleccionar..."
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
      <h3 class="mt-2">Seleccionados</h3>
      <div v-if="store.tratamientos.length === 0">
        No hay tratamientos seleccionados.
      </div>
      <div v-else class="overflow-x-auto">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px">
          <thead>
            <tr>
              <th style="text-align: left">Código</th>
              <th style="text-align: left">Tratamiento</th>
              <th style="width: 80px">Cant.</th>
              <th>Precio</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in store.tratamientos" :key="it.CCODART">
              <td>{{ it.CCODART }}</td>
              <td>{{ it.CDESCRI }}</td>
              <td>
                <input
                  class="input"
                  type="number"
                  min="1"
                  :value="it.NCANTID"
                  @input="
                    store.actualizarCantidad(it.CCODART, $event.target.value)
                  "
                  style="width: 60px"
                />
              </td>
              <td>S/ {{ it.NPRECIO.toFixed(2) }}</td>
              <td>S/ {{ (it.NPRECIO * it.NCANTID).toFixed(2) }}</td>
              <td>
                <button
                  class="btn btn-secondary"
                  @click="store.quitarTratamiento(it.CCODART)"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Acciones -->
      <div class="mt-2 flex justify-between items-center flex-wrap gap-2">
        <p>
          <strong>Monto Total:</strong>
          S/ {{ store.montoTotal.toFixed(2) }}
        </p>
        <div class="flex gap-2">
          <router-link class="btn btn-secondary" to="/buscar">Atrás</router-link>
          <router-link
            class="btn btn-primary"
            to="/pago"
            @click.prevent="
              $router.push('/pago');
              store.grabarConsumo().catch((e) => alert(e.message));
            "
          >
            Grabar
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
