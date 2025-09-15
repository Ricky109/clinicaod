import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pe.ucsm.clinica',
  appName: 'ClinicaUCSM',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // URL de producción donde está desplegada la PWA (ej: Vercel)
    // Ajusta esta URL a tu dominio real
    url: 'https://tu-dominio-produccion.com',
    cleartext: true
  }
};

export default config;
