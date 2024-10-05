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
    <div class="flex">
      <CanvasJSChart
        class="mt-2"
        :options="chartOptions.temperature"
        :styles="chartStyle.temperature"
        @chart-ref="chartRef"
      />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { InfoDevice, InfoSensor, SocketPayloadSensor } from '../interface/device'
import { NCard } from 'naive-ui'
import { onUnmounted, reactive, ref } from 'vue'
import { useSocketStore } from '../store/socket'
import { useProfileStore } from '../store/profile'

/* local icon */
import _urlWiFiOnlineIcon from '../assets/icon/lottie/wifi-online.json'
import _urlWiFiOfflineIcon from '../assets/icon/lottie/wifi-offline.json'

/* option for chart */
const chartOptions = reactive<{
  temperature: unknown
}>({
  temperature: {
    animationEnabled: true,
    theme: 'dark2', // "light1", "light2", "dark1", "dark2"
    toolTip: {
      shared: true
    },
    title: {
      text: 'History Sensor'
    },
    axisY: {},
    axisX: {
      valueFormatString: 'DD MMM'
    },
    legend: {
      cursor: 'pointer',
      itemclick: function (e) {
        if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
          e.dataSeries.visible = false
        } else {
          e.dataSeries.visible = true
        }
        e.chart.render()
      }
    },
    data: [
      {
        type: 'splineArea',
        showInLegend: 'true',
        name: 'Temperature',
        yValueFormatString: '#0.#%',
        color: '#80DEEA',
        xValueType: 'dateTime',
        xValueFormatString: 'DD MMM YY HH:mm',
        legendMarkerType: 'square',
        dataPoints: [
          { x: new Date('2020-01-01'), y: 81 },
          { x: new Date('2020-01-08'), y: 88 },
          { x: new Date('2020-01-15'), y: 87 },
          { x: new Date('2020-01-22'), y: 93 },
          { x: new Date('2020-01-29'), y: 91 },
          { x: new Date('2020-02-05'), y: 102 },
          { x: new Date('2020-02-12'), y: 101 },
          { x: new Date('2020-02-19'), y: 93 },
          { x: new Date('2020-02-26'), y: 87 },
          { x: new Date('2020-03-04'), y: 79 },
          { x: new Date('2020-03-11'), y: 52 },
          { x: new Date('2020-03-18'), y: 67 },
          { x: new Date('2020-03-25'), y: 64 },
          { x: new Date('2020-04-01'), y: 71 },
          { x: new Date('2020-04-08'), y: 68 },
          { x: new Date('2020-04-15'), y: 68 },
          { x: new Date('2020-04-22'), y: 78 },
          { x: new Date('2020-04-29'), y: 90 },
          { x: new Date('2020-05-06'), y: 88 },
          { x: new Date('2020-05-13'), y: 97 },
          { x: new Date('2020-05-20'), y: 88 }
        ]
      }
    ]
  }
})

/* style chart */
const chartStyle = {
  temperature: {
    width: '100%',
    height: '300px',
    float: 'left'
  }
}

/* socket store */
const { socketIo } = useSocketStore()
const { id: userId } = useProfileStore()

/* define props */
const props = defineProps<{
  device: InfoDevice
}>()
const eventNameStatus = `${userId}/${props.device.id}/status`
const eventNameSensor = `${userId}/${props.device.id}/sensor`

const charts = ref<unknown[]>([])
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

const chartRef = (chartInstance) => {
  charts.value.push(chartInstance)
}

socketIo.on(eventNameStatus, (payload: unknown) => {
  console.log('status: ', socketIo.id, payload)
})

socketIo.on(eventNameSensor, (payload: SocketPayloadSensor) => {
  _sensor.value.temperature = payload.env.temperature.value
  _sensor.value.humidity = payload.env.humidity.value
  _sensor.value.smoke = payload.smoke.value
})

onUnmounted(() => {
  socketIo.off(eventNameStatus)
  socketIo.off(eventNameSensor)
})
</script>
