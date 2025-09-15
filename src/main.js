import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles.css'
import { registerServiceWorker } from './registerServiceWorker'

const app = createApp(App)
app.use(createPinia()).use(router)
app.mount('#app')

// Registrar SW al inicio
registerServiceWorker()
