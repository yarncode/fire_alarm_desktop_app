<template>
  <div>
    <c-device-status :status="_device.value.status === 'ONLINE' ? true : false" />
    <n-tabs class="" type="segment" animated>
      <n-tab-pane name="data-log" tab="Control">
        <c-control :device="{ id: props.device.id, name: formValue.name }" />
      </n-tab-pane>
      <n-tab-pane name="settings" tab="Setting">
        <n-card title="Options" size="small">
          <template #header-extra>
            <remove-device :device="{ ...props.device, name: formValue.name }" />
          </template>
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
  NTabs,
  NTabPane,
  FormInst,
  NForm,
  NFormItem,
  useMessage,
  NCard,
  NInput,
  NButton
} from 'naive-ui'
import { reactive, ref } from 'vue'
import { AxiosError } from 'axios'

import { InfoDevice, NodeStateType } from '@renderer/interface/device'
import { useSocketStore } from '../store/socket'
import { useProfileStore } from '../store/profile'
import { DeviceResponse } from '@renderer/interface/device'
import api from '@renderer/api'

import CControl from '@renderer/components/Control.vue'
import CDeviceStatus from '@renderer/components/DeviceStatus.vue'
import RemoveDevice from '@renderer/components/RemoveDevice.vue'

interface DeviceSetting {
  name: string
  desc: string
}

const rules = {}

const props = defineProps<{
  device: InfoDevice
}>()
const { socketIo } = useSocketStore()
const { id: userId } = useProfileStore()

const messager = useMessage()
const _device = reactive<{ value: InfoDevice }>({
  value: props.device
})
const formRef = ref<FormInst | null>(null)
const formValue = reactive({
  name: props.device.name,
  desc: props.device.desc
})

const eventNameStatus = `${userId}/${props.device.id}/status`

socketIo.on(eventNameStatus, (payload: { status: NodeStateType }) => {
  _device.value.status = payload.status
})

const submitForm = () => {
  api
    .post(`/device/setting?id=${_device.value.id}`, {
      name: formValue.name,
      desc: formValue.desc
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
</script>

<style scoped></style>
