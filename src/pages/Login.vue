<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ CNRODNI: '', CCLAVE: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

// Recuperación de contraseña
const showRecoveryModal = ref(false)
const recoveryForm = ref({ CCODALU: '', CEMAIL: '' })
const sendingRecovery = ref(false)
const recoveryMessage = ref('')
const recoveryError = ref('')

function normalizeCodigo(value) {
  // Solo números y máximo 10 dígitos
  return String(value || '').replace(/\D+/g, '').slice(0, 10)
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function submit() {
  error.value = ''
  try {
    loading.value = true
    // Validaciones
    form.value.CNRODNI = normalizeCodigo(form.value.CNRODNI)
    if (!form.value.CNRODNI || form.value.CNRODNI.length !== 10) {
      error.value = 'CODIGO INVALIDO'
      return
    }
    if (!form.value.CCLAVE || String(form.value.CCLAVE).trim().length === 0) {
      error.value = 'CLAVE INVALIDA'
      return
    }

    // ✅ ENVIAR LA CLAVE EN TEXTO PLANO - el servicio se encarga del hash
    const payload = {
      CNRODNI: form.value.CNRODNI,
      CCLAVE: form.value.CCLAVE // ← TEXTO PLANO, no hasheado
    }
    
    await auth.login(payload)
    router.push('/home')
  } catch (e) {
    error.value = e.message || 'Error'
  } finally {
    loading.value = false
  }
}

function openRecoveryModal() {
  recoveryForm.value = { CCODALU: '', CEMAIL: '' }
  recoveryMessage.value = ''
  recoveryError.value = ''
  showRecoveryModal.value = true
}

function closeRecoveryModal() {
  showRecoveryModal.value = false
}

async function sendRecoveryEmail() {
  recoveryMessage.value = ''
  recoveryError.value = ''
  try {
    // Validaciones básicas
    const codigo = String(recoveryForm.value.CCODALU || '').replace(/[^0-9]/g, '').slice(0, 10)
    const email = String(recoveryForm.value.CEMAIL || '').trim()
    if (!codigo || codigo.length !== 10) {
      recoveryError.value = 'INGRESE UN CÓDIGO DE ALUMNO VÁLIDO'
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      recoveryError.value = 'INGRESE UN CORREO INSTITUCIONAL VÁLIDO'
      return
    }

    sendingRecovery.value = true
    const endpoint = 'https://transacciones.ucsm.edu.pe/MSERP/MsAplicativos/'

    // 1) Solicitar nueva contraseña
    const firstPayload = {
      ID: 'LOGNEWE',
      CCODALU: codigo,
      CEMAIL: email
    }
    const firstRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firstPayload)
    })
    if (!firstRes.ok) throw new Error('NO SE PUDO GENERAR LA NUEVA CONTRASEÑA')
    const firstData = await firstRes.json()

    // 2) Enviar correo con la nueva contraseña
    const secondPayload = {
      ID: 'ERP0014',
      CORIGEN: 0,
      CDEDIC: '<b>Estimado usuario:</b>',
      COBSERV: 'Nueva contraseña: ' + String(firstData?.CPASNEW ?? ''),
      CASUNTO: 'Actualización de contraseña',
      CMENSAJE: 'Su clave fue actualizada con éxito',
      CEMAIL: String(firstData?.CEMAIL ?? email)
    }
    const secondRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(secondPayload)
    })
    if (!secondRes.ok) throw new Error('NO SE PUDO ENVIAR EL CORREO')

    recoveryMessage.value = 'CORREO ENVIADO CON ÉXITO'
  } catch (e) {
    recoveryError.value = e.message || 'ERROR AL ENVIAR CORREO'
  } finally {
    sendingRecovery.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-card card">
      <div class="brand">
        <div class="logo">UCSM</div>
        <div class="subtitle">CLÍNICA ODONTOLÓGICA</div>
      </div>

      <div class="field form-floating">
        <input 
          id="codigo"
          class="input fancy-input" 
          placeholder=" "
          v-model="form.CNRODNI"
          inputmode="numeric"
          pattern="\\d{10}"
          maxlength="10"
          @input="form.CNRODNI = form.CNRODNI.replace(/[^0-9]/g,'').slice(0,10)"
        />
        <label for="codigo">CÓDIGO DE ESTUDIANTE</label>
      </div>

      <div class="field password-field form-floating">
        <input 
          id="password"
          class="input fancy-input" 
          placeholder=" " 
          v-model="form.CCLAVE" 
          :type="showPassword ? 'text' : 'password'"
        />
        <label for="password">CONTRASEÑA</label>
        <span 
          class="eye" 
          @click="togglePasswordVisibility"
          :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </span>
      </div>

      <div class="forgot-wrap">
        <a href="#" role="button" tabindex="0" class="forgot-link" @click.prevent="openRecoveryModal" @keyup.enter.prevent="openRecoveryModal">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <div class="mt-2" style="text-align:center;">
        <button class="btn btn-primary login-btn" @click="submit" :disabled="loading">
          ⎆ Iniciar Sesión
        </button>
      </div>

      <p v-if="error" class="error-msg mt-1">{{ error }}</p>
    </div>
    
    <!-- Modal de recuperación -->
    <div v-if="showRecoveryModal" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card card">
        <div class="modal-header">
          <h3>RECUPERAR CONTRASEÑA</h3>
          <button class="close-btn" @click="closeRecoveryModal" aria-label="Cerrar">×</button>
        </div>
        <div class="modal-body">
          <template v-if="!recoveryMessage">
            <div class="field form-floating">
              <input 
                id="ccodalu"
                class="input fancy-input" 
                placeholder=" "
                v-model="recoveryForm.CCODALU"
                inputmode="numeric"
                pattern="\\d{10}"
                maxlength="10"
                @input="recoveryForm.CCODALU = String(recoveryForm.CCODALU).replace(/[^0-9]/g,'').slice(0,10)"
              />
              <label for="ccodalu">CÓDIGO DE ESTUDIANTE</label>
            </div>
            <div class="field form-floating">
              <input 
                id="cemail"
                class="input fancy-input" 
                placeholder=" "
                v-model="recoveryForm.CEMAIL"
                type="email"
              />
              <label for="cemail">CORREO INSTITUCIONAL</label>
            </div>

            <div class="mt-2">
              <button class="btn btn-primary login-btn" style="width:100%" @click="sendRecoveryEmail" :disabled="sendingRecovery">
                {{ sendingRecovery ? 'Enviando…' : 'Enviar correo' }}
              </button>
            </div>

            <p v-if="recoveryError" class="error-msg mt-1">{{ recoveryError }}</p>
          </template>
          <template v-else>
            <div style="text-align:center;">
              <p class="ok-msg mt-1" style="margin: 12px auto;">{{ recoveryMessage }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap {
  display: flex;
  justify-content: center;
  padding: 24px 12px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 24px 20px;
}

.brand { text-align: center; margin-bottom: 16px; }
.logo { color: var(--verde-ucsm); font-weight: 800; font-size: 48px; letter-spacing: 1px; }
.subtitle { color: #111827; font-weight: 700; font-size: 20px; margin-top: 4px; }

.field { margin-top: 12px; }

/* Form Floating Styles */
.form-floating {
  position: relative;
}

.fancy-input {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 16px 8px 16px;
  box-shadow: 0 1px 0 rgba(0,0,0,.02);
  transition: all 0.3s ease;
  width: 100%;
  font-size: 16px;
}

.fancy-input:focus {
  border-color: var(--verde-ucsm);
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 190, 106, 0.1);
}

.form-floating > label {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 20px 16px 8px 16px;
  pointer-events: none;
  border: 1.5px solid transparent;
  transform-origin: 0 0;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 16px;
  font-weight: 400;
}

.form-floating > .fancy-input:focus ~ label,
.form-floating > .fancy-input:not(:placeholder-shown) ~ label {
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
  color: var(--verde-ucsm);
  font-weight: 500;
}

.password-field { position: relative; }
.password-field .eye {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #6b7280;
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;
  user-select: none;
}

.password-field .eye:hover {
  color: var(--verde-ucsm);
  background: rgba(5, 190, 106, 0.1);
  transform: translateY(-50%) scale(1.1);
}

.password-field .eye:active {
  transform: translateY(-50%) scale(0.95);
}

.login-btn { 
  background: var(--verde-ucsm); 
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background: #04a85a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 190, 106, 0.3);
}

.login-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-msg {
  color: #b91c1c;
  padding: 12px;
  background: rgba(185, 28, 28, 0.08);
  border-radius: 8px;
  text-align: center;
}

.ok-msg {
  color: #065f46;
  padding: 12px;
  background: rgba(5, 150, 105, 0.12);
  border-radius: 8px;
  text-align: center;
}

.forgot-wrap { margin-top: 8px; text-align: right; }
.forgot-link { color: var(--verde-ucsm); text-decoration: underline; cursor: pointer; font-size: 14px; }
.forgot-link:focus { outline: 2px solid rgba(5, 190, 106, 0.4); outline-offset: 2px; border-radius: 4px; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1000;
}

.modal-card {
  width: 100%;
  max-width: 460px;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0 16px;
}

.modal-body { padding: 8px 16px 16px 16px; }

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover { color: #111827; }

@media (max-width: 480px) {
  .logo { font-size: 40px; }
  .subtitle { font-size: 18px; }
}
</style>
