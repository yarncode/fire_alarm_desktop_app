import { defineStore } from 'pinia'

export interface SettingServer {
  hostName: string
  portApi: number
  portSocket: number
  entryPath: string
  apiVersion: string
}

interface SettingState {
  server: SettingServer
  device: {
    hideWarning: boolean
  }
}

export const useSettingStore = defineStore('settings', {
  state: (): SettingState => ({
    server: {
      hostName: import.meta.env.VITE_HOST_NAME,
      portApi: parseInt(import.meta.env.VITE_HOST_API_PORT),
      portSocket: parseInt(import.meta.env.VITE_HOST_SOCKET_PORT),
      entryPath: import.meta.env.VITE_ENTRY_PATH,
      apiVersion: import.meta.env.VITE_API_VERSION
    },
    device: {
      hideWarning: localStorage.getItem('hideWarning') === 'true' ? true : false
    }
  }),
  actions: {
    setHideWarning(value: boolean) {
      this.device.hideWarning = value
      localStorage.setItem('hideWarning', value.toString())
    }
  }
})
