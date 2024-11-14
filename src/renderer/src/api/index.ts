import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { useSettingStore } from '../store/setting'

const env = import.meta.env

const api = axios.create({
  baseURL: `http://${env.VITE_HOST_NAME}:${env.VITE_HOST_API_PORT}/${env.VITE_ENTRY_PATH}/${env.VITE_API_VERSION}`
})

api.interceptors.request.use(
  function (config) {
    const authStore = useAuthStore()
    const { server } = useSettingStore()

    config.baseURL = `http://${server.hostName}:${server.portApi}/${server.entryPath}/${server.apiVersion}`

    if (authStore.runtimeToken && config.url !== '/account/refresh-token') {
      config.headers['_token'] = authStore.runtimeToken
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default api
