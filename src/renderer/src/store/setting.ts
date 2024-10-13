import { defineStore } from 'pinia'

interface SettingState {
  device: {
    hideWarning: boolean
  }
}

export const useSettingStore = defineStore('settings', {
  state: (): SettingState => ({
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
