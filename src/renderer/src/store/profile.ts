import { defineStore } from 'pinia'
import api from '../api'
import { AccountResponse } from '../interface/account'

export interface ProfileResponse extends AccountResponse {
  info: ProfileState
}

export interface ProfileState {
  id: string
  username: string
  email: string
  name: string
  desc: string
  avatar_url: string
}

interface ProfileStore extends ProfileState {
  _isUpdated: boolean
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileStore => ({
    id: '',
    username: '',
    email: '',
    name: '',
    desc: '',
    avatar_url: '',
    _isUpdated: false
  }),
  actions: {
    async getProfile() {
      try {
        const response = await api.get('/account/info')
        const data: ProfileResponse = response.data
        if (data.code === '108000') {
          const { id, username, email, name, desc, avatar_url } = data.info
          this.id = id
          this.username = username
          this.email = email
          this.name = name
          this.desc = desc
          this.avatar_url = avatar_url

          this._isUpdated = true
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  getters: {
    isUpdated: (state) => state._isUpdated
  }
})
