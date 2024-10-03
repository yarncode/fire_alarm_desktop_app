import { defineStore } from 'pinia'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { AccountResponse } from '../interface/account'
import { useProfileStore } from './profile'
import { useSocketStore } from './socket'
import api from '../api'

export interface ResponseRefreshToken extends AccountResponse {
  runtime_token?: string
}
interface PayloadDecodeRuntimeToken extends JwtPayload {
  email: string
}
export type TokenType = 'runtime_token' | 'refresh_token'

export const useAuthStore = defineStore('auth', {
  state: (): {
    runtime_token: string
    refresh_token: string
    id_interval: number
  } => ({
    runtime_token: localStorage.getItem('runtime_token') || '',
    refresh_token: localStorage.getItem('refresh_token') || '',
    id_interval: 0
  }),
  actions: {
    setToken(type: TokenType, token: string) {
      console.log('set token: ', type)

      this[type] = token
      localStorage.setItem(type, token)
    },
    addAuthSocketIo(token: string) {
      const socketStore = useSocketStore()

      /* start client socket connection */
      if (socketStore.socketIo.connected === false) {
        /* set auth */
        socketStore.setAuth(token)
      }
    },
    clearToken(type: TokenType) {
      this[type] = ''
      localStorage.removeItem(type)
    },
    clearAllToken() {
      this.clearToken('runtime_token')
      this.clearToken('refresh_token')
    },
    logout() {
      this.clearAllToken()
      if (this.id_interval) {
        clearInterval(this.id_interval)
        this.id_interval = 0
      }
    },
    runCheckRefreshToken() {
      let getNew = false
      const profileStore = useProfileStore()

      if (!this.refresh_token) {
        return
      }

      if (!this.runtime_token) {
        getNew = true
      }

      const decode: PayloadDecodeRuntimeToken = jwtDecode(this.runtime_token)

      /* if token exp time is less than 20 seconds => goto refresh */
      if ((decode?.exp ?? 0) - Date.now() / 1000 < 20) {
        getNew = true
      } else {
        /* token not expire */
        this.calculateIntervalRefreshToken()
        /* add auth socket */
        this.addAuthSocketIo(this.runtimeToken)
        /* get profile user */
        profileStore.getProfile()
        return
      }

      if (getNew) {
        console.log('goto refresh token')
        this.runRefreshToken(decode.email)
      }
    },
    async runRefreshToken(email: string) {
      const profileStore = useProfileStore()

      return new Promise((resolve, reject) => {
        if (!this.refresh_token) {
          reject()
        }
        api
          .post(
            '/account/refresh-token',
            {
              email
            },
            {
              headers: {
                _token: this.refresh_token
              }
            }
          )
          .then((response) => {
            const data: ResponseRefreshToken = response.data
            if (data.code === '108011') {
              console.log('token is refresh')

              this.setToken('runtime_token', data.runtime_token ?? '')
              /* restart calculate time to refresh */
              this.calculateIntervalRefreshToken()
              /* add auth socket */
              this.addAuthSocketIo(this.runtimeToken)
              /* get profile user */
              profileStore.getProfile()

              resolve(data.runtime_token ?? '')
            }
            reject(data.message)
          })
          .catch((error) => {
            console.log(error)
            reject(error)
          })
      })
    },
    calculateIntervalRefreshToken() {
      if (!this.refresh_token) {
        return
      }

      if (this.id_interval) {
        return
      }

      const decode: PayloadDecodeRuntimeToken = jwtDecode(this.runtime_token)

      console.log('token expire after: ', (decode?.exp ?? 0) - Date.now() / 1000)
      const interval = (decode?.exp ?? 0) - Date.now() / 1000 - 20
      this.id_interval = setInterval(() => {
        this.runRefreshToken(decode.email)
      }, interval * 1000) as unknown as number
      console.log('get token after: ', interval)
    },
    stopIntervalRefreshToken() {
      console.log('stop interval refresh token')
      if (this.id_interval) {
        clearInterval(this.id_interval)
        this.id_interval = 0
      }
    },
    async forceRefreshToken() {
      if (!this.refresh_token) {
        return
      }

      const decode: PayloadDecodeRuntimeToken = jwtDecode(this.runtime_token)

      /* if time is less than 60 seconds => goto refresh */
      if ((decode?.exp ?? 0) - Date.now() / 1000 < 60) {
        console.log('token time less than 60s')
        this.stopIntervalRefreshToken()
        await this.runRefreshToken(decode.email)
      }
    }
  },
  getters: {
    runtimeToken: (state) => state.runtime_token,
    refreshToken: (state) => state.refresh_token
  }
})
