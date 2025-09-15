import { registerSW } from 'virtual:pwa-register'

// Registro de SW con autoUpdate
export const registerServiceWorker = () => {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Cuando hay nueva versión lista
      try {
        // Intento de recarga rápida
        window.location.reload()
      } catch (_) {
        // fallback silencioso
        location.reload()
      }
    },
    onOfflineReady() {
      // SW listo para trabajar offline
      // No hacemos nada adicional por ahora
    }
  })

  return updateSW
}


