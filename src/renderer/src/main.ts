import lottie from 'vue3-lottie'
import { createPinia } from 'pinia'
import router from './router'
import configAxios from './api'

import CanvasJSChart from '@canvasjs/vue-charts'

import './assets/tailwindcss/index.css'
import '@flaticon/flaticon-uicons/css/all/all.css'

import { createApp } from 'vue'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)
app.config.globalProperties.$axios = configAxios

app.use(CanvasJSChart).use(lottie, { name: 'lottie-player' }).use(pinia).use(router).mount('#app')
