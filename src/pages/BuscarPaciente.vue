<script setup>
import { ref, computed } from 'vue'
import { usePacienteStore } from '../store/pacienteStore'

const store = usePacienteStore()
const dni = ref('')
const buscando = ref(false)
const error = ref('')

async function buscar() {
  try {
    error.value = ''
    buscando.value = true
    await store.buscarPaciente(dni.value)
  } catch (e) {
    error.value = e.message
  } finally {
    buscando.value = false
  }
}

async function guardarNuevo() {
  try {
    error.value = ''
    await store.registrarPaciente(store.paciente)
  } catch (e) { error.value = e.message }
}

const soloLectura = computed(() => !store.nuevo && !!store.paciente)
</script>

<template>
  <div class="card">
    <h2>Buscar/Registrar Paciente</h2>
    <div class="grid grid-2">
      <input class="input" placeholder="DNI Paciente" v-model="dni" />
      <div>
        <button class="btn btn-primary" @click="buscar" :disabled="buscando">Buscar</button>
      </div>
    </div>

    <p v-if="error" style="color:#b91c1c">{{ error }}</p>

    <div v-if="store.paciente" class="mt-2">
      <h3>Datos del Paciente</h3>
      <div class="grid grid-2">
        <input class="input" placeholder="DNI" v-model="store.paciente.CNRODNI" :readonly="soloLectura" />
        <input class="input" placeholder="Nombres y Apellidos" v-model="store.paciente.CNOMBRE" :readonly="soloLectura" />
        <input class="input" placeholder="Nro Celular" v-model="store.paciente.CNROCEL" :readonly="soloLectura" />
      </div>
      <div class="mt-2" v-if="store.nuevo">
        <button class="btn btn-primary" @click="guardarNuevo">Guardar Paciente</button>
      </div>
      <div class="mt-2">
        <router-link class="btn btn-secondary" to="/atencion">Siguiente: Atención</router-link>
      </div>
    </div>
  </div>
</template>
