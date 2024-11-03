import { router } from '@/router/router'
import { createApp } from 'vue'
import { App } from './app'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
