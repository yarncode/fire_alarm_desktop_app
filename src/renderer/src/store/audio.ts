import { defineStore } from 'pinia'
import _audioFireWarning from '../assets/audio/warning-sound.mp3'

export enum AudioType {
  AUDIO_WARNING,
  AUDIO_WARNING_PUSH_DEVICE,
  AUDIO_WARNING_REMOVE_DEVICE
}

export interface zaloAudioResponse {
  error_message: string
  error_code: number
  data: {
    url: string
  }
}

export interface AudioDevices {
  id: string
  name?: string
  desc?: string
}

export const genScriptFireAlarm = (devices: AudioDevices[]) => {
  const templatePrefix = 'Cảnh báo! Có thiết bị '
  const templateSuffix = ' hiện đang gặp sự cố, xin vui lòng kiểm tra!'
  let isMoreThanTwo: boolean = false
  if (devices.length > 2) {
    isMoreThanTwo = true
  }
  if (isMoreThanTwo === false) {
    return templatePrefix + devices.map((device) => device.name).join(', ') + templateSuffix
  } else {
    /* get two device name */
    const _devices = devices.slice(0, 2)
    return (
      templatePrefix +
      _devices.map((device) => device.name).join(', ') +
      ` và còn ${devices.length - 2} thiết bị khác` +
      templateSuffix
    )
  }
}

export const useAudioStore = defineStore('audio', {
  state: () => ({
    _audioWarning: new Audio(_audioFireWarning),
    _audioScript: new Audio(),
    _audioDevices: [] as AudioDevices[],
    _idTimeoutCallApi: 0,
    _idSink: localStorage.getItem('speakerId') || ''
  }),
  actions: {
    existDeviceWarning(id: string) {
      return this._audioDevices.some((item) => item.id === id)
    },
    start(type: AudioType, device?: AudioDevices) {
      switch (type) {
        case AudioType.AUDIO_WARNING: {
          this.setOutputAudio(this._idSink)
          if (device) {
            this._audioDevices.push(device)
          }
          if (this._audioWarning.paused) {
            this._audioWarning.loop = true
            this._audioWarning.play()
          }
          break
        }

        case AudioType.AUDIO_WARNING_PUSH_DEVICE: {
          if (device) {
            this._audioDevices.push(device)
            this.restartCalculateScriptAudio()
          }
          break
        }
        default:
          break
      }
    },
    stop(type: AudioType, device?: AudioDevices) {
      switch (type) {
        case AudioType.AUDIO_WARNING: {
          if (device) {
            this._audioDevices = this._audioDevices.filter((item) => item.id !== device.id)
          }
          if (this._audioWarning.paused === false) {
            if (this._audioDevices.length > 0) {
              return
            }
            this._audioWarning.pause()
            this._audioWarning.currentTime = 0
          }
          break
        }

        case AudioType.AUDIO_WARNING_REMOVE_DEVICE: {
          if (device) {
            this._audioDevices = this._audioDevices.filter((item) => item.id !== device.id)
            this.restartCalculateScriptAudio()
          }
          break
        }

        default:
          break
      }
    },
    setOutputAudio(id: string) {
      if (id) {
        this._audioWarning.setSinkId(id)
        this._idSink = id
      }
    },
    restartCalculateScriptAudio() {
      /* check device length */
      if (this._audioDevices.length > 0) {
        /* start warning audio */
        this.start(AudioType.AUDIO_WARNING)
        /* clear timeout if exist & pause audio script */
        if (this._idTimeoutCallApi) {
          clearTimeout(this._idTimeoutCallApi)
          this.stopScriptAudio()
        }
        /* generate script & start that script audio after 3s */
        this._idTimeoutCallApi = setTimeout(async () => {
          try {
            await this.startScriptAudio(genScriptFireAlarm(this._audioDevices), 1.0)
          } catch (error) {
            console.log(error)
          }
        }, 3000) as unknown as number
      } else {
        /* if no device */
        this.stopScriptAudio()
        this.stop(AudioType.AUDIO_WARNING)
      }
    },
    async startScriptAudio(script: string, speed: number) {
      try {
        await this.getScriptAudio(script, speed)
        if (this._audioScript.paused) {
          this._audioScript.loop = true
          console.log('playing...')

          this._audioScript.play()
        }
      } catch (error) {
        console.log(error)
      }
    },
    stopScriptAudio() {
      if (this._audioScript.paused === false) {
        this._audioScript.pause()
        this._audioScript.currentTime = 0
      }
    },
    async getScriptAudio(script: string, speed: number) {
      console.log(import.meta.env.VITE_AUDIO_ZALO_API_KEY)
      if (import.meta.env.VITE_AUDIO_ZALO_API_KEY) {
        try {
          const response = await fetch('https://api.zalo.ai/v1/tts/synthesize', {
            method: 'POST',
            headers: {
              apikey: import.meta.env.VITE_AUDIO_ZALO_API_KEY,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              input: script,
              speed: speed.toString()
            })
          })
          const data: zaloAudioResponse = await response.json()
          if (data.error_code === 0) {
            console.log(data.data.url)
            this._audioScript.src = data.data.url
          } else {
            throw new Error(data.error_message)
          }
        } catch (error: unknown) {
          throw new Error(error?.message || 'Unknown error')
        }
      }
    }
  },
  getters: {
    audioWarning: (state) => state._audioWarning,
    audioScript: (state) => state._audioScript,
    audioDevices: (state) => state._audioDevices
  }
})
