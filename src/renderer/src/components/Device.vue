<template>
  <n-card :title="props.device.name" size="small">
    <template #header-extra>
      <lottie-player
        class="w-8"
        :animation-data="
          _device.value.status === 'OFFLINE' ? _urlWiFiOfflineIcon : _urlWiFiOnlineIcon
        "
      >
      </lottie-player>
    </template>
    <div class="flex">
      <div class="flex-1">
        <n-card>
          <template #header> <span class="text-sm"> Temperature </span> </template>
          <template #header-extra>
            <i class="fi fi-rr-temperature-high leading-none"></i>
          </template>
          <p class="text-center text-3xl mb-2">{{ _sensor.value.temperature.toFixed(1) }}</p>
          <p class="text-center text-3xl">°C</p>
        </n-card>
      </div>
      <div class="flex-1">
        <n-card>
          <template #header> <span class="text-sm"> Humidiry </span> </template>
          <template #header-extra> <i class="fi fi-rr-humidity leading-none"></i> </template>
          <p class="text-center text-3xl mb-2">{{ _sensor.value.humidity.toFixed(1) }}</p>
          <p class="text-center text-3xl">%</p>
          <!-- <line-chart /> -->
        </n-card>
      </div>
      <div class="flex-1">
        <n-card>
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
  </n-card>
</template>

<script setup lang="ts">
import { InfoDevice, NodeStateType } from '../interface/device'
import { InfoSensor, SocketPayloadSensor, SensorInfoSummary } from '../interface/sensor'
import { NCard } from 'naive-ui'
import { onUnmounted, reactive, getCurrentInstance } from 'vue'
import { useSocketStore } from '../store/socket'
import { useProfileStore } from '../store/profile'
import { AxiosError } from 'axios'
import { LineChart, useLineChart } from 'vue-chart-3'
import { Chart, registerables, ChartData, Point, ChartOptions } from 'chart.js'
import { enUS } from 'date-fns/locale'

Chart.register(...registerables)

/* local icon */
import _urlWiFiOnlineIcon from '../assets/icon/lottie/wifi-online.json'
import _urlWiFiOfflineIcon from '../assets/icon/lottie/wifi-offline.json'

/* get globalProperties */
const axios = getCurrentInstance()?.appContext.config.globalProperties.$axios

/* socket store */
const { socketIo } = useSocketStore()
const { id: userId } = useProfileStore()

/* define props */
const props = defineProps<{
  device: InfoDevice
}>()
const eventNameStatus = `${userId}/${props.device.id}/status`
const eventNameSensor = `${userId}/${props.device.id}/sensor`

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
  }
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

if (axios) {
  axios
    .get(`/sensor/info/${_device.value.id}?time=${300}`)
    .then((response) => {
      const sensorInfo: { info: SensorInfoSummary } = response.data
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
}

socketIo.on(eventNameStatus, (payload: { status: NodeStateType }) => {
  console.log('status: ', socketIo.id, payload)
  _device.value.status = payload.status
})

socketIo.on(eventNameSensor, (payload: SocketPayloadSensor) => {
  _sensor.value.temperature = payload.env.temperature.value
  _sensor.value.humidity = payload.env.humidity.value
  _sensor.value.smoke = payload.smoke.value

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
})

onUnmounted(() => {
  socketIo.off(eventNameStatus)
  socketIo.off(eventNameSensor)
})
</script>
