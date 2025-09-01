<script setup>
import { ref } from 'vue'
import tratamientos from '../data/tratamientos.json'
import { usePacienteStore } from '../store/pacienteStore'

const store = usePacienteStore()
const filtro = ref('')
const codigo = ref('')

function agregarPorCodigo() {
  if (!codigo.value) return
  store.cargarTratamientoPorCodigo(codigo.value).catch(err => alert(err.message))
  codigo.value = ''
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
      <p><strong>Paciente:</strong> {{ store.paciente.CNOMBRE || store.paciente.CNRODNI }}</p>

      <div class="grid grid-2">
        <input class="input" placeholder="Buscar tratamiento..." v-model="filtro" />
        <div style="display:flex;gap:8px;">
          <input class="input" style="flex:1" placeholder="Código rápido" v-model="codigo" @keyup.enter="agregarPorCodigo" />
          <button class="btn btn-secondary" @click="agregarPorCodigo">Añadir</button>
        </div>
      </div>

      <div class="mt-2" style="max-height:220px; overflow:auto;">
        <table style="width:100%; border-collapse: collapse;">
          <thead><tr><th style="text-align:left;">Código</th><th style="text-align:left;">Tratamiento</th><th>Cantidad</th><th>Precio</th><th>Total</th><th></th></tr></thead>
          <tbody>
            <tr v-for="t in tratamientos.filter(x => (x.CDESCRI.toLowerCase().includes(filtro.toLowerCase()) || x.CCODART.includes(filtro)))" :key="t.CCODART">
              <td>{{ t.CCODART }}</td>
              <td>{{ t.CDESCRI }}</td>
              <td><button class="btn btn-secondary" @click="store.cargarTratamientoPorCodigo(t.CCODART)">Agregar</button></td>
              <td>S/ {{ t.NPRECIO.toFixed(2) }}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="mt-2">Seleccionados</h3>
      <div v-if="store.tratamientos.length === 0">No hay tratamientos seleccionados.</div>
      <table v-else style="width:100%; border-collapse: collapse;">
        <thead><tr><th style="text-align:left;">Código</th><th style="text-align:left;">Tratamiento</th><th style="width:120px;">Cantidad</th><th>Precio</th><th>Total</th><th></th></tr></thead>
        <tbody>
          <tr v-for="it in store.tratamientos" :key="it.CCODART">
            <td>{{ it.CCODART }}</td>
            <td>{{ it.CDESCRI }}</td>
            <td>
              <input class="input" type="number" min="1" :value="it.NCANTID" @input="store.actualizarCantidad(it.CCODART, $event.target.value)" />
            </td>
            <td>S/ {{ it.NPRECIO.toFixed(2) }}</td>
            <td>S/ {{ (it.NPRECIO * it.NCANTID).toFixed(2) }}</td>
            <td><button class="btn btn-secondary" @click="store.quitarTratamiento(it.CCODART)">Quitar</button></td>
          </tr>
        </tbody>
      </table>

      <div class="mt-2">
        <p><strong>Monto Total:</strong> S/ {{ store.montoTotal.toFixed(2) }}</p>
        <router-link class="btn btn-secondary" to="/buscar">Atrás</router-link>
        <router-link class="btn btn-primary" to="/pago" @click.prevent="$router.push('/pago'); store.grabarConsumo().catch(e=>alert(e.message))">Grabar</router-link>
      </div>
    </div>
  </div>
</template>
