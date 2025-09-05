<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ CNRODNI: '', CCLAVE: '' })
const loading = ref(false)
const error = ref('')

function normalizeCodigo(value) {
  // Solo números y máximo 10 dígitos
  return String(value || '').replace(/\D+/g, '').slice(0, 10)
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
</script>

<template>
  <div class="login-wrap">
    <div class="login-card card">
      <div class="brand">
        <div class="logo">UCSM</div>
        <div class="subtitle">CLÍNICA ODONTOLÓGICA</div>
      </div>

      <div class="field">
        <input 
          class="input fancy-input" 
          placeholder="CODIGO"
          v-model="form.CNRODNI"
          inputmode="numeric"
          pattern="\\d{10}"
          maxlength="10"
          @input="form.CNRODNI = form.CNRODNI.replace(/[^0-9]/g,'').slice(0,10)"
        />
      </div>

      <div class="field password-field">
        <input class="input fancy-input" placeholder="Contraseña" v-model="form.CCLAVE" type="password" />
        <span class="eye" aria-hidden="true">👁️</span>
      </div>

      <div class="mt-2" style="text-align:center;">
        <button class="btn btn-primary login-btn" @click="submit" :disabled="loading">
          ⎆ Iniciar Sesión
        </button>
      </div>

      <p v-if="error" class="error-msg mt-1">{{ error }}</p>
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
.fancy-input {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 0 rgba(0,0,0,.02);
}
.password-field { position: relative; }
.password-field .eye {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #6b7280;
}

.login-btn { background: var(--verde-ucsm); min-width: 220px; }

.error-msg {
  color: #b91c1c;
  padding: 12px;
  background: rgba(185, 28, 28, 0.08);
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 480px) {
  .logo { font-size: 40px; }
  .subtitle { font-size: 18px; }
}
</style>
