<template>
  <div>
    <c-device-status :status="_device.value.status === 'ONLINE' ? true : false" />
    <n-tabs class="" type="segment" animated>
      <n-tab-pane name="data-log" tab="Control">
        <c-control :device="{ id: props.device.id, name: props.device.name }" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import { reactive } from 'vue'

import { InfoDevice, NodeStateType } from '@renderer/interface/device'
import { useSocketStore } from '../store/socket'
import { useProfileStore } from '../store/profile'

import CControl from '@renderer/components/Control.vue'
import CDeviceStatus from '@renderer/components/DeviceStatus.vue'

const props = defineProps<{
  device: InfoDevice
}>()
const { socketIo } = useSocketStore()
const { id: userId } = useProfileStore()

const _device = reactive<{ value: InfoDevice }>({
  value: props.device
})

const eventNameStatus = `${userId}/${props.device.id}/status`

socketIo.on(eventNameStatus, (payload: { status: NodeStateType }) => {
  _device.value.status = payload.status
})
</script>

<style scoped></style>
