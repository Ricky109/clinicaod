<script setup>
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
</script>

<template>
  <div class="home-container">
    <!-- Nombre del usuario logueado -->
    <div class="usuario-container">
      <h1 class="usuario-nombre">{{ auth.user?.CNOMBRE || 'USUARIO' }}</h1>
    </div>

    <!-- Cards de opciones -->
    <div class="options-grid">
      <!-- Card Buscar/Registrar Paciente -->
      <router-link to="/buscar" class="option-card">
        <div class="card-icon">
          <div class="icon-search">🔍</div>
        </div>
        <div class="card-text">BUSCAR/REGISTRAR PACIENTE</div>
      </router-link>

      <!-- Card Historial de Pagos -->
      <router-link to="/historial" class="option-card">
        <div class="card-icon">
          <div class="icon-chart">📊</div>
        </div>
        <div class="card-text">HISTORIAL DE PAGOS</div>
      </router-link>

    </div>
  </div>
</template>


