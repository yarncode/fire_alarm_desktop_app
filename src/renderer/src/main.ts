import lottie from 'vue3-lottie'
import { createPinia } from 'pinia'
import router from './router'
import configAxios from './api'

import 'chartjs-adapter-date-fns';

import '@renderer/assets/tailwindcss/index.css'
import '@flaticon/flaticon-uicons/css/all/all.css'

import { createApp } from 'vue'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)
app.config.globalProperties.$axios = configAxios
app.use(lottie, { name: 'lottie-player' }).use(pinia).use(router).mount('#app')
