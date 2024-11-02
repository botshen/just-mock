import { createApp } from 'vue';
import './style.css'
import { App } from './app'
import { router } from '@/router/router';
const app = createApp(App)
app.use(router)
app.mount('#app')
