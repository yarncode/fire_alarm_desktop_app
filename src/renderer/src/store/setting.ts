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
      hostName: localStorage.getItem('hostName') ?? import.meta.env.VITE_HOST_NAME,
      portApi: parseInt(localStorage.getItem('portApi') ?? import.meta.env.VITE_HOST_API_PORT),
      portSocket: parseInt(
        localStorage.getItem('portSocket') ?? import.meta.env.VITE_HOST_SOCKET_PORT
      ),
      entryPath: localStorage.getItem('entryPath') ?? import.meta.env.VITE_ENTRY_PATH,
      apiVersion: localStorage.getItem('apiVersion') ?? import.meta.env.VITE_API_VERSION
    },
    device: {
      hideWarning: localStorage.getItem('hideWarning') === 'true' ? true : false
    }
  }),
  actions: {
    setHideWarning(value: boolean) {
      this.device.hideWarning = value
      localStorage.setItem('hideWarning', value.toString())
    },
    /* @return true if server setting has changed & false if not */
    compareServerSetting(value: SettingServer): boolean {
      return Object.keys(value).find((key) => value[key] !== this.server[key]) ? true : false
    },
    saveServerSetting(value: SettingServer) {
      this.server = { ...this.server, ...value }

      Object.keys(this.server).forEach((key) => {
        localStorage.setItem(key, this.server[key].toString())
      })
    }
  }
})
