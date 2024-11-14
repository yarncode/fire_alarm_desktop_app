<template>
  <div>
    <c-device-status :status="_device.value.status === 'ONLINE' ? true : false" />
    <n-tabs class="" type="segment" animated>
      <n-tab-pane name="data-log" tab="Monitor">
        <n-card :title="props.device.name" size="small">
          <template #header-extra>
            <!-- <lottie-player
              class="w-8"
              :animation-data="
                _device.value.status === 'OFFLINE' ? _urlWiFiOfflineIcon : _urlWiFiOnlineIcon
              "
            >
            </lottie-player> -->
          </template>
          <div class="relative">
            <div class="flex">
              <div class="flex-1">
                <!-- highlightSensor.temperature -->
                <n-card :class="{ 'highlight-sensor': highlightSensor.temperature }">
                  <template #header> <span class="text-sm"> Temperature </span> </template>
                  <template #header-extra>
                    <i class="fi fi-rr-temperature-high leading-none"></i>
                  </template>
                  <p class="text-center text-3xl mb-2">
                    {{ _sensor.value.temperature.toFixed(1) }}
                  </p>
                  <p class="text-center text-3xl">°C</p>
                </n-card>
              </div>
              <div class="flex-1">
                <n-card :class="{ 'highlight-sensor': highlightSensor.humidity }">
                  <template #header> <span class="text-sm"> Humidiry </span> </template>
                  <template #header-extra>
                    <i class="fi fi-rr-humidity leading-none"></i>
                  </template>
                  <p class="text-center text-3xl mb-2">{{ _sensor.value.humidity.toFixed(1) }}</p>
                  <p class="text-center text-3xl">%</p>
                  <!-- <line-chart /> -->
                </n-card>
              </div>
              <div class="flex-1">
                <n-card :class="{ 'highlight-sensor': highlightSensor.smoke }">
                  <template #header> <span class="text-sm"> Smoke </span> </template>
                  <template #header-extra> <i class="fi fi-tr-smoking leading-none"></i> </template>
                  <p class="text-center text-3xl mb-2">{{ _sensor.value.smoke.toFixed(0) }}</p>
                  <p class="text-center text-3xl">ppm</p>
                </n-card>
              </div>
            </div>
            <div class="flex overflow-hidden mt-4">
              <LineChart class="w-full" v-bind="lineChartProps" />
            </div>
            <!-- start box notify -->
            <div
              :class="warningFirePayload.state ? 'opacity-100' : 'opacity-0 pointer-events-none'"
              class="absolute w-full h-full top-0 left-0 backdrop-blur-sm transition-opacity"
            >
              <!-- this is modal -->
              <n-element
                tag="div"
                style="background-color: var(--card-color)"
                class="overflow-hidden h-fit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 rounded-3xl"
              >
                <!-- this icon notify -->
                <div
                  class="px-5 pt-5 border-2 border-red-400 border-b-0 rounded-3xl rounded-b-none"
                >
                  <lottie-player class="w-16 h-16" :animation-data="_urlBlinkNotifyIcon" />
                  <p class="text-sm py-2 w-full text-slate-400">
                    Warning: {{ warningFirePayload.message }}
                  </p>
                  <n-radio
                    class="pb-2"
                    :checked="_setting.device.value.hideWarning"
                    name="modal-never-show"
                    @click="handleCheckShowModal"
                  >
                    Dont show again.
                  </n-radio>
                </div>
                <div class="flex">
                  <button
                    class="w-full bg-red-400 hover:bg-red-500 p-2 transition-colors"
                    @click="
                      () => {
                        warningFirePayload.state = false
                        _audio.stop(AudioType.AUDIO_WARNING, { id: props.device.id })
                      }
                    "
                  >
                    OK, i know
                  </button>
                </div>
              </n-element>
            </div>
          </div>
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="control-remote" tab="Control">
        <c-control :device="{ id: props.device.id, name: props.device.name }" />
      </n-tab-pane>
      <n-tab-pane name="settings" tab="Setting">
        <n-card title="Options" size="small">
          <n-form
            ref="formRef"
            :label-width="80"
            :model="formValue"
            :rules="rules"
            size="large"
            style="margin: 1rem 0"
          >
            <n-form-item label="Name" path="name">
              <n-input
                v-model:value="formValue.name"
                clearable
                text="text"
                placeholder="example: {name device}"
              />
            </n-form-item>
            <n-form-item label="Description" path="desc">
              <n-input
                v-model:value="formValue.desc"
                clearable
                type="textarea"
                placeholder="example: {description about device}"
              />
            </n-form-item>
            <n-form-item path="rangeNotify.smoke">
              <template #label>
                <div class="flex items-center">
                  <lottie-player class="w-8" :animation-data="_urlSmokeIcon"> </lottie-player>
                  <span class="ml-2">
                    Notify smoke if value from {{ formValue.rangeNotify.smoke[0] }} ppm to
                    {{ formValue.rangeNotify.smoke[1] }} ppm
                  </span>
                </div>
              </template>
              <n-slider
                v-model:value="formValue.rangeNotify.smoke"
                range
                :min="200"
                :max="10000"
                :step="10"
                :format-tooltip="(smoke) => `${smoke} (ppm)`"
              />
            </n-form-item>
            <n-form-item path="rangeNotify.temperature">
              <template #label>
                <div class="flex items-center">
                  <lottie-player class="w-8" :animation-data="_urlTemperatureIcon"> </lottie-player>
                  <span class="ml-2">
                    Notify temperature 'if value from {{ formValue.rangeNotify.temperature[0] }} °C
                    to {{ formValue.rangeNotify.temperature[1] }} °C
                  </span>
                </div>
              </template>
              <n-slider
                v-model:value="formValue.rangeNotify.temperature"
                :min="20"
                :max="200"
                range
                :step="10"
                :format-tooltip="(smoke) => `${smoke} (°C)`"
              />
            </n-form-item>
            <n-form-item
              :label="`Notify humidity 'if value from ${formValue.rangeNotify.temperature[0]} % to ${formValue.rangeNotify.temperature[1]} %'`"
              path="rangeNotify.humidity"
            >
              <template #label>
                <div class="flex items-center">
                  <i class="fi fi-rr-humidity leading-none"></i>
                  <span class="ml-2">
                    Notify humidity 'if value from {{ formValue.rangeNotify.humidity[0] }} % to
                    {{ formValue.rangeNotify.humidity[1] }} %
                  </span>
                </div>
              </template>
              <n-slider
                v-model:value="formValue.rangeNotify.humidity"
                range
                :step="10"
                :format-tooltip="(smoke) => `${smoke} (%)`"
              />
            </n-form-item>
            <n-form-item class="flex justify-end">
              <n-button type="primary" @click="submitForm">
                Update
                <template #icon>
                  <i class="fi fi-rr-cloud-upload leading-none"></i>
                </template>
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import {
  DeviceResponse,
  InfoDevice,
  NodeStateType,
  NotifyPayload,
  DeviceSettingResponse
} from '../interface/device'
import { InfoSensor, SocketPayloadSensor, SensorInfoSummary } from '../interface/sensor'
import CControl from '@renderer/components/Control.vue'
import CDeviceStatus from '@renderer/components/DeviceStatus.vue'

import {
  NRadio,
  NCard,
  NTabPane,
  NTabs,
  FormInst,
  NForm,
  NFormItem,
  NSlider,
  NInput,
  NButton,
  NElement,
  useMessage
} from 'naive-ui'
import { onUnmounted, reactive, ref, getCurrentInstance, h } from 'vue'
import { useSocketStore } from '../store/socket'
import { useProfileStore } from '../store/profile'
import { useSettingStore } from '../store/setting'
import { useAudioStore, AudioType } from '../store/audio'
import { AxiosError } from 'axios'
import { LineChart, useLineChart } from 'vue-chart-3'
import { Chart, registerables, ChartData, Point, ChartOptions } from 'chart.js'
import { enUS } from 'date-fns/locale'
import { storeToRefs } from 'pinia'

Chart.register(...registerables)

/* local icon */
// import _urlWiFiOnlineIcon from '../assets/icon/lottie/wifi-online.json'
// import _urlWiFiOfflineIcon from '../assets/icon/lottie/wifi-offline.json'
import _urlSmokeIcon from '../assets/icon/lottie/smoke.json'
import _urlTemperatureIcon from '../assets/icon/lottie/temperature.json'
import _urlBlinkNotifyIcon from '../assets/icon/lottie/blink_notify.json'

interface SensorThreshold {
  start: number
  end: number
}

interface DeviceSetting {
  name: string
  desc: string
  threshold: {
    temperature: SensorThreshold
    humidity: SensorThreshold
    smoke: SensorThreshold
  }
}

/* get globalProperties */
const axios = getCurrentInstance()?.appContext.config.globalProperties.$axios

/* socket store */
const messager = useMessage()
const { socketIo } = useSocketStore()
const { id: userId } = useProfileStore()
const _audio = useAudioStore()
const _settingStore = useSettingStore()
const _setting = storeToRefs(_settingStore)

/* define props */
const props = defineProps<{
  device: InfoDevice
}>()
const eventNameStatus = `${userId}/${props.device.id}/status`
const eventNameSensor = `${userId}/${props.device.id}/sensor`
const eventNameSyncThreshold = `${userId}/${props.device.id}/sync_threshold`
// const eventDeviceSyncThreshold = `device/${props.device.id}/setting`

const rules = {
  // email: {
  //   required: true,
  //   trigger: 'blur',
  //   validator: validateEmail
  // }
}
const highlightSensor = reactive<{
  temperature: boolean
  humidity: boolean
  smoke: boolean
}>({
  temperature: false,
  humidity: false,
  smoke: false
})
const warningFirePayload = reactive<{
  state: boolean
  message: string
}>({
  state: false,
  message: 'Temperature is too high'
})
const formRef = ref<FormInst | null>(null)
const formValue = reactive({
  name: props.device.name,
  desc: props.device.desc,
  rangeNotify: {
    smoke: [300, 7000],
    temperature: [50, 100],
    humidity: [0, 100]
  }
})
const _device = reactive<{ value: InfoDevice }>({
  value: props.device
})
const _sensor = reactive<{ value: InfoSensor }>({
  value: {
    temperature: 0,
    humidity: 0,
    smoke: 0
  }
})

const _chartOptions = reactive<ChartOptions<'line'>>({
  scales: {
    myScale: {
      type: 'time',
      axis: 'x',
      date: {
        locale: enUS
      }
    }
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 0.8
    },
    point: {
      radius: 2
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  },
  aspectRatio: 1 / 1
})

const _chartData = reactive<ChartData<'line'>>({
  // labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
  // labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: '#0079AF',
      borderColor: '#0079AF',
      label: 'Temperature'
    },
    {
      data: [],
      backgroundColor: '#4DFF56FF',
      borderColor: '#4DFF56FF',
      label: 'Humidity'
    },
    {
      data: [],
      backgroundColor: '#FFAC4DFF',
      borderColor: '#FFAC4DFF',
      label: 'Smoke'
    }
  ]
})

const { lineChartProps } = useLineChart({
  chartData: _chartData,
  options: _chartOptions
})

const handleCheckShowModal = () => {
  _settingStore.setHideWarning(!_setting.device.value.hideWarning)
}

const submitForm = () => {
  axios
    ?.post(`/device/setting?id=${_device.value.id}`, {
      name: formValue.name,
      desc: formValue.desc,
      threshold: {
        temperature: {
          start: formValue.rangeNotify.temperature[0],
          end: formValue.rangeNotify.temperature[1]
        },
        humidity: {
          start: formValue.rangeNotify.humidity[0],
          end: formValue.rangeNotify.humidity[1]
        },
        smoke: {
          start: formValue.rangeNotify.smoke[0],
          end: formValue.rangeNotify.smoke[1]
        }
      }
    } as DeviceSetting)
    .then((res) => {
      const _data = res.data as DeviceResponse
      if (_data.code === '107017') {
        messager.success(`Information of device "${_device.value.name}" is saved.`)
      }
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        console.log(error.message)
      }
    })
}

if (axios) {
  /* get sensor info */
  axios
    .get(`/sensor/info/${_device.value.id}?time=${300}`)
    .then((response) => {
      const sensorInfo: { info: SensorInfoSummary } = response.data

      _sensor.value.temperature =
        sensorInfo.info.temperature[sensorInfo.info.temperature.length - 1].value
      _sensor.value.humidity = sensorInfo.info.humidity[sensorInfo.info.humidity.length - 1].value
      _sensor.value.smoke = sensorInfo.info.smoke[sensorInfo.info.smoke.length - 1].value

      // console.log('sensor info: ', sensorInfo)
      _chartData.datasets[0].data = sensorInfo.info.temperature.map(
        (item) =>
          ({
            x: new Date(item.update_at).getTime(),
            y: Number(item.value)
          }) as Point
      )
      _chartData.datasets[1].data = sensorInfo.info.humidity.map(
        (item) =>
          ({
            x: new Date(item.update_at).getTime(),
            y: Number(item.value)
          }) as Point
      )
      _chartData.datasets[2].data = sensorInfo.info.smoke.map(
        (item) =>
          ({
            x: new Date(item.update_at).getTime(),
            y: Number(item.value)
          }) as Point
      )
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        console.log(error.message)
      }
    })

  /* get device setting */
  axios
    .get(`/device/setting?id=${_device.value.id}`)
    .then((res) => {
      const { info }: { info: DeviceSettingResponse } = res.data

      console.log(info)

      formValue.rangeNotify.temperature[0] = info.threshold.temperature.start
      formValue.rangeNotify.temperature[1] = info.threshold.temperature.end
      formValue.rangeNotify.humidity[0] = info.threshold.humidity.start
      formValue.rangeNotify.humidity[1] = info.threshold.humidity.end
      formValue.rangeNotify.smoke[0] = info.threshold.smoke.start
      formValue.rangeNotify.smoke[1] = info.threshold.smoke.end
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        console.log(error.message)
      }
    })
}

socketIo.on(eventNameStatus, (payload: { status: NodeStateType }) => {
  console.log('status: ', socketIo.id, payload)
  _device.value.status = payload.status
})

socketIo.on(eventNameSyncThreshold, (payload: NotifyPayload) => {
  console.log('payload: ', payload)

  if (payload._type === 'SYNC_THRESHOLD') {
    messager.success(() =>
      h('div', [
        h('p', `Device ${_device.value.name} - ${_device.value.mac}`),
        h('p', `Sync threshold successfully.`)
      ])
    )
  }
})

socketIo.on(eventNameSensor, (payload: SocketPayloadSensor) => {
  _sensor.value.temperature = payload.env.temperature.value || 0
  _sensor.value.humidity = payload.env.humidity.value || 0
  _sensor.value.smoke = payload.smoke.value || 0

  _chartData.datasets[0].data.push({
    x: new Date(payload.env.temperature.time_at).getTime(),
    y: Number(payload.env.temperature.value)
  } as Point)

  _chartData.datasets[1].data.push({
    x: new Date(payload.env.humidity.time_at).getTime(),
    y: Number(payload.env.humidity.value)
  } as Point)

  _chartData.datasets[2].data.push({
    x: new Date(payload.smoke.time_at).getTime(),
    y: Number(payload.smoke.value)
  } as Point)

  let startNotify: boolean = false
  let message: string = ''

  if (
    _sensor.value.temperature >= formValue.rangeNotify.temperature[0] &&
    _sensor.value.temperature <= formValue.rangeNotify.temperature[1]
  ) {
    startNotify = true
    message += '- Temperature cross the threshold value\n'
    highlightSensor.temperature = true
  } else {
    highlightSensor.temperature = false
  }

  if (
    _sensor.value.humidity >= formValue.rangeNotify.humidity[0] &&
    _sensor.value.humidity <= formValue.rangeNotify.humidity[1]
  ) {
    startNotify = true
    message += '- Humidity cross the threshold value\n'
    highlightSensor.humidity = true
  } else {
    highlightSensor.humidity = false
  }

  if (
    _sensor.value.smoke >= formValue.rangeNotify.smoke[0] &&
    _sensor.value.smoke <= formValue.rangeNotify.smoke[1]
  ) {
    startNotify = true
    message += '- Smoke cross the threshold value\n'
    highlightSensor.smoke = true
  } else {
    highlightSensor.smoke = false
  }

  if (startNotify) {
    warningFirePayload.message = message

    if (_setting.device.value.hideWarning === false) {
      warningFirePayload.state = true
    }

    _audio.start(AudioType.AUDIO_WARNING, {
      id: _device.value.id
    })
  } else {
    /* stop warning if value is normal */
    if (_audio.existDeviceWarning(_device.value.id)) {
      _audio.stop(AudioType.AUDIO_WARNING, { id: _device.value.id })
    }
  }
})

onUnmounted(() => {
  socketIo.off(eventNameStatus)
  socketIo.off(eventNameSensor)
  socketIo.off(eventNameSyncThreshold)
})
</script>

<style scoped lang="css">
/* generate css animation keyframe blink single bg color */
@keyframes blink {
  0% {
    background-color: #ef4444;
  }
  50% {
    background-color: transparent;
  }
  100% {
    background-color: #ef4444;
  }
}

.highlight-sensor {
  animation: blink 1s ease-in-out infinite;
}
</style>
