import { defineStore } from 'pinia'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { AccountResponse } from '../interface/account'
import { useProfileStore } from './profile'
import api from '../api'

export interface ResponseRefreshToken extends AccountResponse {
  runtime_token?: string
}

export interface ResRuntimeToken extends AccountResponse {
  runtime_token: string
}

interface PayloadDecodeRuntimeToken extends JwtPayload {
  email: string
}

interface PayloadTokenUser extends JwtPayload {
  email: string
}

interface CustomExpire {
  exp: number
  state: boolean
}

export type TokenType = 'runtime_token' | 'refresh_token'

export const useAuthStore = defineStore('auth', {
  state: (): {
    runtime_token: string
    refresh_token: string
    loopTokenRefresh: boolean
    idTimeout: number
  } => ({
    runtime_token: localStorage.getItem('runtime_token') || '',
    refresh_token: localStorage.getItem('refresh_token') || '',
    loopTokenRefresh: false,
    idTimeout: 0
  }),
  actions: {
    setToken(type: TokenType, token: string) {
      this[type] = token
      localStorage.setItem(type, token)
    },
    cleanToken(type: TokenType) {
      this[type] = ''
      localStorage.removeItem(type)
    },
    clearAllToken(): void {
      this.cleanToken('runtime_token')
      this.cleanToken('refresh_token')
    },
    onRuntimeTokenValid(): void {
      const { isUpdated, getProfile } = useProfileStore()

      if (isUpdated === false) {
        getProfile()
      }
    },
    isAuth() {
      return this.runtime_token.length > 0 && this.refresh_token.length > 0
    },
    isTokenExpired(type: TokenType, timeDelay: number = 20): CustomExpire {
      /* get payload by token */
      const _payload: PayloadTokenUser = jwtDecode(this[type])
      const _expire = (_payload?.exp ?? 0) - Date.now() / 1000
      /* check status token */
      return _expire < timeDelay
        ? {
            exp: _expire - 20,
            state: true
          }
        : {
            exp: _expire - 20,
            state: false
          }
    },
    async getRefreshToken(): Promise<string | undefined> {
      try {
        /* get payload contain email */
        const _payload: PayloadTokenUser = jwtDecode(this.refresh_token)
        /* get response server */
        const response = await api.post(
          '/account/refresh-token',
          {
            email: _payload.email
          },
          {
            headers: {
              _token: this.refresh_token
            }
          }
        )
        const _data: ResRuntimeToken = response.data

        if (_data.code === '108011') {
          return _data.runtime_token
        }
      } catch (error) {}
      return undefined
    },
    async gotoRefreshToken(): Promise<void> {
      const _isExpire = this.isTokenExpired('runtime_token')

      if (_isExpire.state) {
        console.log('_token is expire. goto refresh token...')

        /* call api refresh token */
        const _token = await this.getRefreshToken()
        if (_token) {
          this.setToken('runtime_token', _token)
        }
      }

      /* parse token */
      const _payload: PayloadDecodeRuntimeToken = jwtDecode(this.runtime_token)
      const _dateNow = Date.now() / 1000
      const _nextTime = Math.ceil((_payload?.exp ?? 0) - _dateNow - 20)

      this.loopTokenRefresh = false // unlock
      if (_nextTime > 0) {
        console.log('Next time refresh token: ', _nextTime)
        this.gotoRefreshTokenWithTime(this.gotoRefreshToken, _nextTime * 1000)
      } else {
        const _time = 5
        console.log('Next time refresh token: ', _time)
        this.gotoRefreshTokenWithTime(this.gotoRefreshToken, _time * 1000)
      }
    },
    async gotoRefreshTokenWithTime(cb: () => Promise<void>, time: number): Promise<void> {
      if (this.loopTokenRefresh === false) {
        this.idTimeout = setTimeout(async () => {
          await cb()
        }, time) as unknown as number
        /* lock setTimeout */
        this.loopTokenRefresh = true
      }
    },
    async activeRunnerCheckToken(): Promise<void> {
      if (this.hasRunnerCheckToken()) {
        return
      }

      /* dispatch check token */
      const _expire = this.isTokenExpired('runtime_token')

      /* if token is expire */
      if (_expire.state) {
        await this.gotoRefreshToken()
        /* if token is not expire */
      } else {
        const _expireNum = Math.ceil(_expire.exp)
        console.log('_token expire: ', _expireNum)
        /* goto refresh token after range time */
        this.gotoRefreshTokenWithTime(this.gotoRefreshToken, _expireNum * 1000)
      }

      this.onRuntimeTokenValid()
    },
    logout() {
      /* stop loop token */
      this.stopLoopTokenRefresh()
      /* clean token */
      this.clearAllToken()
    },
    stopLoopTokenRefresh() {
      if (this.idTimeout) {
        clearTimeout(this.idTimeout)
        this.loopTokenRefresh = false
      }
    },
    hasRunnerCheckToken(): boolean {
      return this.loopTokenRefresh
    }
  },
  getters: {
    runtimeToken: (state) => state.runtime_token,
    refreshToken: (state) => state.refresh_token
  }
})
