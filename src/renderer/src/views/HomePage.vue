<template>
  <div class="h-full">
    <!-- <p class="text-2xl mb-5 cursor-pointer">List gateway</p> -->
    <n-collapse :default-expanded-names="['1', '2']">
      <n-collapse-item name="1">
        <template #header><p class="text-xl">List gateway</p></template>
        <n-grid :x-gap="12" :y-gap="8" cols="400:1 800:2 1500:3 1800:4 2100:5">
          <n-grid-item
            v-for="device in devices.value.filter((device) => device.type === 'GATEWAY')"
            :key="device.mac"
          >
            <c-gateway :device="device" />
          </n-grid-item>
        </n-grid>
      </n-collapse-item>
      <!-- <p class="text-2xl my-5 cursor-pointer">List node</p> -->
      <n-collapse-item name="2">
        <template #header><p class="text-xl">List node</p></template>
        <n-grid :x-gap="12" :y-gap="8" cols="400:1 800:2 1500:3 1800:4 2100:5">
          <n-grid-item
            v-for="device in devices.value.filter((device) => device.type === 'NODE')"
            :key="device.mac"
          >
            <c-device :device="device" />
          </n-grid-item>
        </n-grid>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'
import { onUnmounted, reactive } from 'vue'
import { InfoDevice, DeviceResponse } from '../interface/device'
import api from '@renderer/api'
import { useSocketStore } from '../store/socket'
import { useProfileStore } from '../store/profile'

import { useEventBus } from '@vueuse/core'

/* import lib component */
import { NGrid, NGridItem, NCollapse, NCollapseItem } from 'naive-ui'

/* import custom component */
import CDevice from '../components/Device.vue'
import CGateway from '../components/Gateway.vue'

interface ListDeviceInfo extends DeviceResponse {
  info: InfoDevice[]
}

/* get globalProperties */
const devices = reactive<{ value: InfoDevice[] }>({ value: [] })
const { socketIo } = useSocketStore()
const { id: userId } = useProfileStore()

const busRemoveDevice = useEventBus<string>('remove-device')

function listenerRemoveDevice(id: string) {
  console.log(`remove device id: ${id}`)
  devices.value = devices.value.filter((device) => device.id !== id)
}

const unsubscribe = busRemoveDevice.on(listenerRemoveDevice)

api
  .get('/device/info/list')
  .then((response) => {
    const _devices: ListDeviceInfo = response.data
    devices.value = _devices.info
  })
  .catch((error) => {
    if (error instanceof AxiosError) {
      console.log(error.message)
    }
  })

socketIo.on(`${userId}/device/add`, (payload) => {
  const { id } = JSON.parse(payload)
  console.log('device add: ', id)
})

onUnmounted(() => {
  unsubscribe()
  socketIo.off(`${userId}/device/add`)
})
</script>
