import { defineStore } from 'pinia'
import instanceSocket from '../socket'

export const useSocketStore = defineStore('socket-io', {
  state: () => ({
    _socketIo: instanceSocket
  }),
  actions: {
    setAuth(token: string) {
      if (this._socketIo.connected === false) {
        this._socketIo.auth = { token }
        this._socketIo.connect()
      }
    }
  },
  getters: {
    socketIo: (state) => state._socketIo
  }
})
