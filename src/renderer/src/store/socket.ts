import { defineStore } from 'pinia'
import { Socket, io } from 'socket.io-client'
import { useAuthStore } from '@renderer/store/auth'

interface AckSwitch {
  [key: number]: {
    pos: number
    state: boolean
    cb: (unlock: number, fallbackState: boolean) => void
  }
}

export type eventSocket = 'connect' | 'disconnect'

export type EventSocketHandler = {
  [key in eventSocket]: ((socket: Socket) => void)[]
}

export const useSocketStore = defineStore('socket-io', {
  state: (): {
    _socket: Socket
    _ackWait: AckSwitch
    _event: EventSocketHandler
    firstInit: boolean
    idIntervalAck: number | undefined
    token: string
  } => ({
    _socket: io(`ws://localhost:3000`, {
      autoConnect: false,
      auth: (cb) => {
        const { runtimeToken } = useAuthStore()
        cb({ token: runtimeToken })
      }
    }),
    _ackWait: {},
    _event: { connect: [], disconnect: [] },
    firstInit: true,
    idIntervalAck: undefined,
    token: ''
  }),
  actions: {
    removeAckWait(key: number) {
      delete this._ackWait[key]

      if (this.idIntervalAck && Object.keys(this._ackWait).length === 0) {
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

      if (this.idIntervalAck === undefined && Object.keys(this._ackWait).length > 0) {
        /* add time Interval */
        this.createAckInterval()
      }
    },
    getAckWait(key: number) {
      return this._ackWait[key]
    },
    createAckInterval() {
      console.log('create ack interval')

      this.idIntervalAck = setInterval(() => {
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
      if (this.idIntervalAck) {
        console.log('remove ack interval')

        clearInterval(this.idIntervalAck)
        this.idIntervalAck = undefined
      }
    },
    setAuth(token: string) {
      this.token = token
    },
    addListener(event: eventSocket, cb: (socket: Socket) => void) {
      this._event[event].push(cb)
    },
    removeListener(event: eventSocket, cb: (socket: Socket) => void) {
      this._event[event] = this._event[event].filter((item) => item !== cb)
    },
    removeAllListener() {
      this._event = { connect: [], disconnect: [] }
    },
    setupSocket(hostName: string, port: number) {
      /* disconnect if connected */
      if (this._socket.connected) {
        /* remove event */
        this._socket.off('connect')
        this._socket.off('disconnect')
        this._socket.disconnect()
      }

      /* create new socket */
      const _sock = io(`ws://${hostName}:${port}`, {
        autoConnect: false,
        auth: (cb) => {
          const { runtimeToken } = useAuthStore()
          cb({ token: runtimeToken })
        }
      })
        .on('connect', () => {
          this._event.connect.forEach((cb) => cb(_sock))
        })
        .on('disconnect', () => {
          this._event.disconnect.forEach((cb) => cb(_sock))
        })

      /* set socket into store */
      this._socket = _sock
    },
    connect() {
      this._socket.connect()
    }
  },
  getters: {
    socketIo: (state) => state._socket
  }
})
