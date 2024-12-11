<template>
  <div>
    <n-button round type="error" @click="handleRemoveDevice">Xóa thiết bị</n-button>
  </div>
</template>

<script setup lang="ts">
import { useDialog, useMessage } from 'naive-ui'
import { NButton } from 'naive-ui'
import { useEventBus } from '@vueuse/core'
import api from '@renderer/api'
import { AxiosError } from 'axios'
import { DeviceResponse, InfoDevice } from '@renderer/interface/device'

const props = defineProps<{
  device: InfoDevice
}>()
const busRemoveDevice = useEventBus<string>('remove-device')
const dialog = useDialog()
const message = useMessage()

const handleRemoveDevice = () => {
  dialog.warning({
    title: 'Remove device',
    content: 'Are you sure remove this device?',
    positiveText: 'Sure',
    negativeText: 'Cancel',
    onPositiveClick: () => {
      console.log('remove device')

      busRemoveDevice.emit(props.device.id)

      api
        .post(`/device/remove?id=${props.device.id}`)
        .then((res) => {
          const _data = res.data as DeviceResponse
          if (_data.code === '107013') {
            message.success(`Remove device "${props.device.name}" successfully.`)
          }
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            console.log(error.message)
          }
        })
    }
  })
}
</script>

<style scoped></style>
