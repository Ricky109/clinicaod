# Clínica Odontológica UCSM · Vue 3 + Vite + Pinia + Router + PWA + Capacitor

## Scripts
- `npm install`
- `npm run dev` → desarrollo
- `npm run build` → producción
- `npm run preview` → vista previa
- `npm run android` → compila y abre Android Studio (requiere SDK)

## PWA
La configuración está en `vite.config.js` con `vite-plugin-pwa`.

## APK (Android)
1. `npm run build`
2. `npx cap init ClinicaUCSM pe.ucsm.clinica` (una sola vez si no está inicializado)
3. `npx cap add android` (una sola vez)
4. `npx cap copy android`
5. `npx cap open android` → generar APK desde Android Studio.
