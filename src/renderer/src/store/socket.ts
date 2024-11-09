import { defineStore } from 'pinia'
import instanceSocket from '../socket'
import { Socket } from 'socket.io-client'

interface AckSwitch {
  [key: number]: {
    pos: number
    state: boolean
    cb: (unlock: number, fallbackState: boolean) => void
  }
}

export const useSocketStore = defineStore('socket-io', {
  state: () =>
    ({
      _socketIo: instanceSocket,
      firstInit: true,
      _ackWait: {},
      idItervalAck: undefined
    }) as {
      _socketIo: Socket
      firstInit: boolean
      _ackWait: AckSwitch
      idItervalAck: number | undefined
    },
  actions: {
    removeAckWait(key: number) {
      delete this._ackWait[key]

      if (this.idItervalAck && Object.keys(this._ackWait).length === 0) {
        /* remove time Interval */
        this.removeAckInterval()
      }
    },
    setAckWait(
      key: number,
      value: number,
      pastState: boolean,
      cb: (unlock: number, fallbackState: boolean) => void
    ) {
      this._ackWait[key] = { pos: value, state: pastState, cb }

      if (this.idItervalAck === undefined && Object.keys(this._ackWait).length > 0) {
        /* add time Interval */
        this.createAckInterval()
      }
    },
    getAckWait(key: number) {
      return this._ackWait[key]
    },
    createAckInterval() {
      console.log('create ack interval')

      this.idItervalAck = setInterval(() => {
        /* check ack is outdate */
        const now = Date.now()

        Object.keys(this._ackWait).forEach((key) => {
          const _ackDate = parseInt(key)
          console.log(_ackDate)

          if (now - _ackDate > 3000) {
            const ctxAck = this._ackWait[_ackDate]
            ctxAck.cb(ctxAck.pos, ctxAck.state)
            this.removeAckWait(_ackDate)
          }
        })
      }, 2000) as unknown as number
    },
    removeAckInterval() {
      if (this.idItervalAck) {
        console.log('remove ack interval')

        clearInterval(this.idItervalAck)
        this.idItervalAck = undefined
      }
    },
    setAuth(token: string) {
      if (this.firstInit) {
        this._socketIo.on('connect', this._onConnected)
        this._socketIo.on('disconnect', this._onDisconnected)
        this.firstInit = false
      }

      if (this._socketIo.connected === false) {
        this._socketIo.auth = { token }
        this._socketIo.connect()
      }
    },
    _onConnected() {
      console.log('socket connected: ', this._socketIo.id)
    },
    _onDisconnected() {
      console.log('socket disconnected: ', this._socketIo.id)
    }
  },
  getters: {
    socketIo: (state) => state._socketIo
  }
})
