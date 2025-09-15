<script setup>
import { ref, computed } from "vue";
import { usePacienteStore } from "../store/pacienteStore";
import { useAuthStore } from "../store/authStore";

const store = usePacienteStore();
const dni = ref("");
const buscando = ref(false);
const error = ref("");
const editandoCelular = ref(false);
const intentoRegistro = ref(false);

// Validación de DNI - solo 8 dígitos numéricos
function validarDNI(value) {
  const soloNumeros = value.replace(/\D/g, "");
  return soloNumeros.slice(0, 8);
}

function onDNIInput(event) {
  const valorLimpio = validarDNI(event.target.value);
  dni.value = valorLimpio;
  event.target.value = valorLimpio;
}

// Permite solo letras (incluye acentos y espacios) y convierte a mayúsculas
function soloLetrasMayus(value) {
  if (!value) return "";
  return String(value)
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, "");
}

async function buscar() {
  try {
    error.value = "";
    if (dni.value.length !== 8) {
      error.value = "El DNI debe tener exactamente 8 dígitos";
      return;
    }

    buscando.value = true;
    await store.buscarPaciente(dni.value);

    if (!store.nuevo) {
      editandoCelular.value = false;
    } else {
      // Si es nuevo, inicializar campos vacíos
      editandoCelular.value = false;
      // Inicializar campos para nuevo paciente
      store.paciente.CAPEPAT = "";
      store.paciente.CAPEMAT = "";
      store.paciente.CNOMBRE = "";
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    buscando.value = false;
  }
}

async function guardarPaciente() {
  try {
    error.value = "";
    const auth = useAuthStore();

    if (store.nuevo) {
      const nombreCompleto =
        `${store.paciente.CAPEPAT} ${store.paciente.CAPEMAT} ${store.paciente.CNOMBRE}`.trim();
      store.paciente.CNOMBRE = nombreCompleto;
    }

    // ✅ Conversión de fecha DD/MM/AAAA → AAAA-MM-DD
    if (store.paciente.DNACIMI) {
      const fecha = String(store.paciente.DNACIMI);
      if (fecha.includes("/")) {
        const [dd, mm, yyyy] = fecha.split("/");
        store.paciente.DNACIMI = `${yyyy}-${mm}-${dd}`;
      }
    }

    // ✅ Agregar automáticamente el DNI del tratante logeado
    store.paciente.CDNIEST = auth.dniTratante;

    await store.registrarPaciente(store.paciente);
    editandoCelular.value = false;
  } catch (e) {
    error.value = e.message;
  }
}

function editarCelular() {
  editandoCelular.value = true;
}

function cancelarEdicion() {
  editandoCelular.value = false;
}

// Computed para determinar si mostrar botón de guardar
const mostrarGuardar = computed(() => {
  return store.nuevo || editandoCelular.value;
});

// Computed para determinar si el celular es editable
const celularEditable = computed(() => {
  return store.nuevo || editandoCelular.value;
});

// Computed para determinar si mostrar campos de fecha nacimiento y DNI tratante
const mostrarCamposAdicionales = computed(() => {
  return store.nuevo;
});

// Computed para determinar si es paciente existente (mostrar nombre completo)
const esPacienteExistente = computed(() => {
  return !store.nuevo && store.paciente;
});

// Solo permitir ir a Tratamiento cuando el paciente ya esté registrado (no nuevo)
const puedeIrATratamiento = computed(() => {
  return !!store.paciente && !store.nuevo;
});
</script>

<template>
  <div class="card">
    <h2 style="text-align: center">BUSCAR/REGISTRAR PACIENTE</h2>

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
      <div style="text-align: center">
        <button
          class="btn btn-primary btn-buscar"
          @click="buscar"
          :disabled="buscando || dni.length !== 8"
        >
          {{ buscando ? "🔍 Buscando..." : "🔍 Buscar" }}
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

        <!-- Para pacientes NUEVOS: Campos separados -->
        <template v-if="store.nuevo">
          <!-- Apellido Paterno -->
          <label>PRIMER APELLIDO:</label>
          <input
            class="input"
            v-model="store.paciente.CAPEPAT"
            @input="
              store.paciente.CAPEPAT = soloLetrasMayus(store.paciente.CAPEPAT)
            "
            placeholder="INGRESE PRIMER APELLIDO"
          />
          <small
            v-if="intentoRegistro && !(store.paciente.CAPEPAT || '').trim()"
            class="campo-obligatorio"
            >*Campo obligatorio*</small
          >

          <!-- Apellido Materno -->
          <label>SEGUNDO APELLIDO:</label>
          <input
            class="input"
            v-model="store.paciente.CAPEMAT"
            @input="
              store.paciente.CAPEMAT = soloLetrasMayus(store.paciente.CAPEMAT)
            "
            placeholder="INGRESE SEGUNDO APELLIDO"
          />
          <small
            v-if="intentoRegistro && !(store.paciente.CAPEMAT || '').trim()"
            class="campo-obligatorio"
            >*Campo obligatorio*</small
          >

          <!-- Nombres -->
          <label>NOMBRES:</label>
          <input
            class="input"
            v-model="store.paciente.CNOMBRE"
            @input="
              store.paciente.CNOMBRE = soloLetrasMayus(store.paciente.CNOMBRE)
            "
            placeholder="INGRESE NOMBRES"
          />
          <small
            v-if="intentoRegistro && !(store.paciente.CNOMBRE || '').trim()"
            class="campo-obligatorio"
            >*Campo obligatorio*</small
          >
        </template>

        <template v-else>
          <label>NOMBRE:</label>
          <input
            class="input input-readonly"
            :value="store.paciente.CNOMBRE"
            readonly
          />
        </template>

        <!-- Sexo (solo mostrar cuando se registra un paciente nuevo) -->
        <template v-if="store.nuevo">
          <label>SEXO:</label>
          <select class="input" v-model="store.paciente.CSEXO">
            <option value="M">MASCULINO</option>
            <option value="F">FEMENINO</option>
          </select>
        </template>

        <!-- Fecha de Nacimiento (solo para nuevos pacientes) -->
        <template v-if="mostrarCamposAdicionales">
          <label>FECHA DE NACIMIENTO: (DD/MM/AAAA)</label>
          <input
            class="input"
            type="date"
            v-model="store.paciente.DNACIMI"
            placeholder="DD/MM/AAAA"
          />
          <small
            v-if="
              intentoRegistro &&
              !(store.paciente.DNACIMI || '').toString().trim()
            "
            class="campo-obligatorio"
            >*Campo obligatorio*</small
          >
        </template>

        <!-- Celular con input group y acción fija -->
        <label>CELULAR DEL PACIENTE:</label>
        <div class="input-group">
          <input
            class="input input-group-field"
            :class="{ 'input-readonly': !celularEditable }"
            v-model="store.paciente.CNROCEL"
            @input="
              store.paciente.CNROCEL = store.paciente.CNROCEL.replace(
                /\D/g,
                ''
              ).slice(0, 9)
            "
            maxlength="9"
            inputmode="numeric"
            pattern="[0-9]{9}"
            :readonly="!celularEditable"
            placeholder="INGRESE NÚMERO DE CELULAR"
          />

          <div class="action-slot">
            <button
              v-if="!store.nuevo && !editandoCelular"
              class="btn-edit right-addon"
              @click="editarCelular"
              title="Editar celular"
            >
              ✏️
            </button>
            <button
              v-else-if="editandoCelular && !store.nuevo"
              class="btn btn-secondary btn-cancel"
              @click="cancelarEdicion"
            >
              Cancelar
            </button>
          </div>
        </div>
        <small
          v-if="
            intentoRegistro && !(store.paciente.CNROCEL || '').toString().trim()
          "
          class="campo-obligatorio"
          >*Campo obligatorio*</small
        >
      </div>

      <!-- Botones de acción -->
      <div class="mt-2 button-group">
        <button
          v-if="mostrarGuardar"
          class="btn btn-primary btn-buscar"
          @click="guardarPaciente"
        >
          {{ store.nuevo ? "👤 Registrar Paciente" : "💾 Guardar Cambios" }}
        </button>

        <router-link
          v-if="puedeIrATratamiento"
          class="btn btn-primary btn-buscar"
          to="/atencion"
        >
          🏥 Tratamiento
        </router-link>
        <button
          v-else
          class="btn btn-primary btn-buscar"
          disabled
          title="Complete el registro del paciente para continuar"
        >
          🏥 Tratamiento
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campo-obligatorio {
  color: #b91c1c;
  font-size: 12px;
  margin-top: 4px;
}
.input-readonly {
  background-color: #f3f4f6; /* gris claro */
  color: #6b7280; /* texto gris */
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

/* boton editar celular */
.input-group {
  display: flex;
  width: 100%;
  align-items: center;
}

.btn-edit {
  background: rgba(5, 190, 106, 0.1);
  border: 2px solid rgba(5, 190, 106, 0.3);
  color: #05be6a;
  padding: 6px 10px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  min-width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
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

.button-group .btn {
  min-width: 100px;
}

/* Separación vertical entre Registrar Paciente y Tratamiento cuando ambos están visibles */
.button-group .btn-buscar + .btn-buscar {
  margin: 15px 0 0;
}

/* Asegurar disposición en columna también en pantallas grandes */
.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Unificar ancho de botones en pantallas grandes */
.button-group .btn-buscar {
  width: 200px;
}

/* Input group para celular */
.input-group {
  display: flex;
  width: 100%;
  align-items: flex;
  height: 40px;
}

.input-group-field {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.action-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.right-addon {
  height: 100%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.btn-cancel {
  background: rgba(220, 38, 38, 0.1);
  border: 2px solid rgba(220, 38, 38, 0.3);
  color: #dc2626;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.3s ease;
  min-width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.btn-cancel:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.5);
  transform: translateY(-1px);
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
