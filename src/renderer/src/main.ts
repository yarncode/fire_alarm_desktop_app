import { createPinia } from 'pinia'
import router from './router'
import configAxios from './api';

import './assets/tailwindcss/index.css'

import { createApp } from 'vue'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)
app.config.globalProperties.$axios = configAxios;

app.use(pinia).use(router).mount('#app')
