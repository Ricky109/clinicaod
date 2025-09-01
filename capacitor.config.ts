import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pe.ucsm.clinica',
  appName: 'ClinicaUCSM',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
