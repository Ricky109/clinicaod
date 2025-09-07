<script setup>
import { ref, computed } from 'vue'
import { usePacienteStore } from '../store/pacienteStore'

const store = usePacienteStore()
const dni = ref('')
const buscando = ref(false)
const error = ref('')
const editandoCelular = ref(false)

// Validación de DNI - solo 8 dígitos numéricos
function validarDNI(value) {
  const soloNumeros = value.replace(/\D/g, '')
  return soloNumeros.slice(0, 8)
}

function onDNIInput(event) {
  const valorLimpio = validarDNI(event.target.value)
  dni.value = valorLimpio
  event.target.value = valorLimpio
}

async function buscar() {
  try {
    error.value = ''
    if (dni.value.length !== 8) {
      error.value = 'El DNI debe tener exactamente 8 dígitos'
      return
    }
    
    buscando.value = true
    const resultado = await store.buscarPaciente(dni.value)
    
    // Si el paciente existe, llenar automáticamente los campos
    if (!store.nuevo && resultado) {
      // Los datos ya se llenan automáticamente en el store
      editandoCelular.value = false
    } else if (store.nuevo) {
      // Si es nuevo, inicializar campos vacíos
      editandoCelular.value = false
    }
  } catch (e) {
    error.value = e.message
  } finally {
    buscando.value = false
  }
}

async function guardarPaciente() {
  try {
    error.value = ''
    await store.registrarPaciente(store.paciente)
    editandoCelular.value = false
  } catch (e) { 
    error.value = e.message 
  }
}

function editarCelular() {
  editandoCelular.value = true
}

function cancelarEdicion() {
  editandoCelular.value = false
  // Restaurar valor original si es necesario
}

// Computed para determinar si mostrar botón de guardar
const mostrarGuardar = computed(() => {
  return store.nuevo || editandoCelular.value
})

// Computed para determinar si el celular es editable
const celularEditable = computed(() => {
  return store.nuevo || editandoCelular.value
})
</script>

<template>
  <div class="card">
    <h2 style="text-align: center;">BUSCAR/REGISTRAR PACIENTE</h2>
    
    <!-- Campo DNI con validación -->
    <div class="grid grid-2">
      <input 
        class="input" 
        placeholder="DNI PACIENTE (8 dígitos)" 
        :value="dni"
        @input="onDNIInput"
        maxlength="8"
        inputmode="numeric"
        pattern="[0-9]{8}"
      />
      
      <!-- Botón Buscar -->
      <div style="text-align:center;">
        <button class="btn btn-SALIR" @click="buscar" :disabled="buscando || dni.length !== 8">
          {{ buscando ? 'BUSCANDO...' : 'BUSCAR' }}
        </button>
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="error-message">{{ error }}</p>

    <!-- Datos del paciente -->
    <div v-if="store.paciente" class="mt-2">
      <h3>DATOS DEL PACIENTE</h3>
      <div class="grid grid-1">
        <!-- DNI -->
        <label>DNI:</label>
        <input 
          class="input input-readonly" 
          :value="store.paciente.CNRODNI" 
          readonly 
        />

        <!-- Apellido Paterno -->
        <label>APELLIDO PATERNO:</label>
        <input 
          v-if="store.nuevo" 
          class="input" 
          v-model="store.paciente.CAPEPAT" 
          @input="store.paciente.CAPEPAT = store.paciente.CAPEPAT.toUpperCase()" 
          placeholder="Ingrese apellido paterno"
        />
        <input 
          v-else 
          class="input input-readonly" 
          :value="store.paciente.CAPEPAT" 
          readonly 
        />

        <!-- Apellido Materno -->
        <label>APELLIDO MATERNO:</label>
        <input 
          v-if="store.nuevo" 
          class="input" 
          v-model="store.paciente.CAPEMAT" 
          @input="store.paciente.CAPEMAT = store.paciente.CAPEMAT.toUpperCase()" 
          placeholder="Ingrese apellido materno"
        />
        <input 
          v-else 
          class="input input-readonly" 
          :value="store.paciente.CAPEMAT" 
          readonly 
        />

        <!-- Nombres -->
        <label>NOMBRES:</label>
        <input 
          v-if="store.nuevo" 
          class="input" 
          v-model="store.paciente.CNOMBRE" 
          @input="store.paciente.CNOMBRE = store.paciente.CNOMBRE.toUpperCase()" 
          placeholder="Ingrese nombres"
        />
        <input 
          v-else 
          class="input input-readonly" 
          :value="store.paciente.CNOMBRE" 
          readonly 
        />

        <!-- Sexo -->
        <label>SEXO:</label>
        <select 
          v-if="store.nuevo" 
          class="input" 
          v-model="store.paciente.CSEXO"
        >
          <option value="M">MASCULINO</option>
          <option value="F">FEMENINO</option>
        </select>
        <input 
          v-else 
          class="input input-readonly" 
          :value="store.paciente.CSEXO === 'M' ? 'MASCULINO' : 'FEMENINO'" 
          readonly 
        />

        <!-- Fecha de Nacimiento -->
        <label>FECHA DE NACIMIENTO:</label>
        <input 
          v-if="store.nuevo" 
          class="input" 
          type="date"
          v-model="store.paciente.DNACIMI" 
          placeholder="Seleccione fecha de nacimiento"
        />
        <input 
          v-else 
          class="input input-readonly" 
          :value="store.paciente.DNACIMI" 
          readonly 
        />

        <!-- DNI del Estudiante -->
        <label>DNI DEL TRATANTE:</label>
        <input 
          v-if="store.nuevo" 
          class="input" 
          v-model="store.paciente.CDNIEST" 
          @input="store.paciente.CDNIEST = store.paciente.CDNIEST.replace(/\D/g, '').slice(0, 8)"
          maxlength="8"
          inputmode="numeric"
          pattern="[0-9]{8}"
          placeholder="Ingrese DNI del estudiante"
        />
        <input 
          v-else 
          class="input input-readonly" 
          :value="store.paciente.CDNIEST" 
          readonly 
        />

        <!-- Celular con icono de edición -->
        <label>CELULAR DEL PACIENTE:</label>
        <div class="celular-container">
          <input 
            class="input" 
            :class="{ 'input-readonly': !celularEditable }"
            v-model="store.paciente.CNROCEL" 
            @input="store.paciente.CNROCEL = store.paciente.CNROCEL.replace(/\D/g, '').slice(0, 9)"
            maxlength="9"
            inputmode="numeric"
            pattern="[0-9]{9}"
            :readonly="!celularEditable"
            placeholder="Ingrese número de celular"
          />
          <button 
            v-if="!store.nuevo && !editandoCelular" 
            class="btn-edit" 
            @click="editarCelular"
            title="Editar celular"
          >
            ✏️
          </button>
          <div v-if="editandoCelular && !store.nuevo" class="edit-buttons">
            <button class="btn btn-secondary btn-sm" @click="cancelarEdicion">CANCELAR</button>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="mt-2 button-group">
        <button 
          v-if="mostrarGuardar" 
          class="btn btn-primary" 
          @click="guardarPaciente"
        >
          {{ store.nuevo ? 'REGISTRAR PACIENTE' : 'GUARDAR CAMBIOS' }}
        </button>
        
        <router-link class="btn btn-SALIR" to="/atencion">
          TRATAMIENTO
        </router-link>
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

/* Estilos para el select */
select.input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

select.input:focus {
  outline: none;
  border-color: var(--verde-ucsm);
  box-shadow: 0 0 0 3px rgba(5, 190, 106, 0.1);
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

.celular-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.celular-container .input {
  flex: 1;
}

.btn-edit {
  background: rgba(5, 190, 106, 0.1);
  border: 2px solid rgba(5, 190, 106, 0.3);
  color: #05be6a;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit:hover {
  background: rgba(5, 190, 106, 0.2);
  border-color: rgba(5, 190, 106, 0.5);
  transform: translateY(-1px);
}

.edit-buttons {
  display: flex;
  gap: 8px;
  margin-left: 8px;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.button-group .btn {
  min-width: 150px;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .celular-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-edit {
    align-self: flex-end;
    width: fit-content;
  }
  
  .edit-buttons {
    margin-left: 0;
    margin-top: 8px;
    justify-content: flex-end;
  }
  
  .button-group {
    flex-direction: column;
    align-items: center;
  }
  
  .button-group .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
