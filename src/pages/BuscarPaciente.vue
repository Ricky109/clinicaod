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
    // Si es nuevo inicializamos los campos separados
    if (store.nuevo) {
      store.paciente.apellido1 = ''
      store.paciente.apellido2 = ''
      store.paciente.nombres = ''
      store.paciente.CNROCEL = ''
    }
  } catch (e) {
    error.value = e.message
  } finally {
    buscando.value = false
  }
}

async function guardarNuevo() {
  try {
    error.value = ''
    // Construimos CNOMBRE antes de registrar
    store.paciente.CNOMBRE = `${store.paciente.apellido1 || ''}/${store.paciente.apellido2 || ''}/${store.paciente.nombres || ''}`
    await store.registrarPaciente(store.paciente)
  } catch (e) { error.value = e.message }
}

const soloLectura = computed(() => !store.nuevo && !!store.paciente)

const primerApellido = computed(() => {
  if (!store.paciente?.CNOMBRE) return ''
  return store.paciente.CNOMBRE.split('/')[0] || ''
})
const segundoApellido = computed(() => {
  if (!store.paciente?.CNOMBRE) return ''
  return store.paciente.CNOMBRE.split('/')[1] || ''
})
const nombres = computed(() => {
  if (!store.paciente?.CNOMBRE) return ''
  return store.paciente.CNOMBRE.split('/')[2] || ''
})
</script>

<template>
  <div class="card">
    <h2>Buscar/Registrar Paciente</h2>
    <!-- Botón INICIO debajo del título -->
    <div class="mt-2" style="text-align:center;">
      <router-link class="btn btn-secondary" to="/home">INICIO</router-link>
    </div>
    <div class="grid grid-2">
      <input class="input" placeholder="DNI Paciente" v-model="dni" />
      
      <!-- Botón Buscar en su propio contenedor -->
      <div style="text-align:center;">
        <button class="btn btn-primary" @click="buscar" :disabled="buscando">
          Buscar
        </button>
      </div>
    </div>



    <p v-if="error" style="color:#b91c1c">{{ error }}</p>

    <div v-if="store.paciente" class="mt-2">
      <h3>Datos del Paciente</h3>
      <div class="grid grid-1">
        <label>DNI:</label>
        <input 
          :class="['input', soloLectura ? 'input-readonly' : '']" 
          v-model="store.paciente.CNRODNI" 
          :readonly="soloLectura" 
        />

        <label>Primer Apellido:</label>
        <input v-if="store.nuevo" class="input" v-model="store.paciente.apellido1" @input="store.paciente.apellido1 = store.paciente.apellido1.toUpperCase()" />
        <input v-else class="input input-readonly" :value="primerApellido" readonly />

        <label>Segundo Apellido:</label>
        <input v-if="store.nuevo" class="input" v-model="store.paciente.apellido2" @input="store.paciente.apellido2 = store.paciente.apellido2.toUpperCase()" />
        <input v-else class="input input-readonly" :value="segundoApellido" readonly />

        <label>Nombres:</label>
        <input v-if="store.nuevo" class="input" v-model="store.paciente.nombres" @input="store.paciente.nombres = store.paciente.nombres.toUpperCase()" />
        <input v-else class="input input-readonly" :value="nombres" readonly />

        <label>Celular:</label>
        <input 
          class="input" 
          v-model="store.paciente.CNROCEL" 
          @input="store.paciente.CNROCEL = store.paciente.CNROCEL.toUpperCase().replace(/\D/g, '').slice(0, 9)"
          maxlength="9"
          inputmode="numeric"
          pattern="[0-9]{9}"
        />
      </div>

      <div class="mt-2" v-if="store.nuevo">
        <button class="btn btn-primary" @click="guardarNuevo">Guardar Paciente</button>
      </div>
      <div class="mt-2">
        <router-link class="btn btn-success" to="/atencion">Tratamiento</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-readonly {
  background-color: #f3f4f6; /* gris claro */
  color: #6b7280;           /* texto gris */
  cursor: not-allowed;
}
</style>
