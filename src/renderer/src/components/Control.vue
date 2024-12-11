<template>
  <n-card :title="props.device.name" size="small">
    <n-card :title="`Input (number: ${ioDevice.input.length})`" size="small">
      <div v-if="ioDevice.input.length === 0">
        <n-result size="small" description="Device not found any input.">
          <template #icon>
            <div class="text-3xl">🧐</div>
          </template>
        </n-result>
      </div>
      <div v-else class="flex">
        <n-tooltip
          v-for="(input, index) in ioDevice.input"
          :key="index"
          placement="top"
          trigger="hover"
        >
          <template #trigger>
            <div
              class="w-5 h-5 m-1 rounded-sm shadow cursor-pointer"
              :class="
                input.value ? 'bg-green-400 shadow-green-500' : 'bg-slate-500 shadow-slate-500'
              "
            ></div>
          </template>
          <span> {{ input.value ? 'Active' : 'Inactive' }} </span>
        </n-tooltip>
      </div>
    </n-card>
    <n-card :title="`Output (number: ${ioDevice.output.length})`" size="small" class="mt-4">
      <template #header-extra>
        <div v-if="ioDevice.output.length > 0" class="flex">
          <p class="font-bold mr-2">Switch all</p>
          <n-switch
            v-model:value="ioOutAll.value"
            :disabled="ioOutAll.locker || switchLocker"
            @update-value="(_newState) => changeStateAllSwitch(_newState)"
          />
        </div>
      </template>
      <div v-if="ioDevice.output.length === 0">
        <n-result size="small" description="Device not found any output.">
          <template #icon>
            <div class="text-3xl">🧐</div>
          </template>
        </n-result>
      </div>
      <div v-else class="grid grid-cols-4 gap-2">
        <div
          v-for="(output, index) in ioDevice.output"
          :key="index"
          class="border border-gray-700 rounded-md p-4"
        >
          <p class="mb-2">{{ `Swicth ${index + 1}` }}</p>
          <n-switch
            v-model:value="output.value"
            :disabled="output.locker || switchLocker"
            @update-value="(_newState) => changeState(index, _newState)"
          />
        </div>
      </div>
    </n-card>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NResult, NTooltip, NSwitch } from 'naive-ui'
import { onUnmounted, reactive, watchEffect, ref } from 'vue'

import { storeToRefs } from 'pinia'
import { useSocketStore } from '@renderer/store/socket'
import { DeviceResponse } from '@renderer/interface/device'
import api from '@renderer/api'

export interface IoDetail {
  value: boolean
  update_at: string
  _id: string
}

export interface IoDetailWithLocker extends IoDetail {
  locker: boolean
}

export interface ResDeviceIo {
  input: Array<IoDetail>
  output: Array<IoDetail>
  createdAt: string
  updatedAt: string
}

interface IoData {
  input: Array<IoDetailWithLocker>
  output: Array<IoDetailWithLocker>
}

interface ListIoInfo extends DeviceResponse {
  info: ResDeviceIo
}

interface PropsDevice {
  id: string
  name: string
}

interface PayloadIo {
  deviceId: string
  data: {
    pos: number
    state: boolean
    mode: 'all' | 'single'
    type: 'input' | 'output'
    _ack?: string
  }
}

const props = defineProps<{
  device: PropsDevice
}>()

const { socketIo } = storeToRefs(useSocketStore())
const { getAckWait, setAckWait, removeAckWait } = useSocketStore()
const ioOutAll = reactive<{
  locker: boolean
  value: boolean
}>({
  locker: false,
  value: false
})
const ioInAll = reactive<{
  value: boolean
}>({
  value: false
})

const ioDevice = reactive<IoData>({
  input: [],
  output: []
})
const switchLocker = ref<boolean>(false)

const unWatch = watchEffect(() => {
  if (socketIo.value.connected) {
    switchLocker.value = false
  } else {
    switchLocker.value = true
  }
})

const checkSwitchAll = () => {
  if (ioDevice.output.find((item) => item.value === false)) {
    ioOutAll.value = false
  } else {
    ioOutAll.value = true
  }
}

const changeAllSwitchState = () => {
  ioDevice.output.forEach((item) => {
    item.value = ioOutAll.value
  })
}

const changeStateAllSwitch = (state: boolean) => {
  console.log('change all switch: ', state)

  if (socketIo.value.connected) {
    const _ack = Date.now()
    const _io: PayloadIo = {
      deviceId: props.device.id,
      data: {
        pos: -1,
        state,
        _ack: _ack.toString(),
        mode: 'all',
        type: 'output'
      }
    }
    ioOutAll.locker = true
    setAckWait(_ack, -1, !ioOutAll.value, (_, state) => {
      ioOutAll.locker = false
      ioOutAll.value = state
    })
    /* send control via socketIo */
    socketIo.value.emit('control_io', _io)
  }
}

const changeState = (pos: number, state: boolean) => {
  console.log('change switch: ', pos, 'new state: ', state)
  /* send control via socketIo */

  if (socketIo.value.connected && ioDevice.output[pos].locker === false) {
    const _ack = Date.now()
    const _io: PayloadIo = {
      deviceId: props.device.id,
      data: {
        pos,
        state,
        _ack: _ack.toString(),
        mode: 'single',
        type: 'output'
      }
    }
    ioDevice.output[pos].locker = true
    setAckWait(_ack, pos, !ioDevice.output[pos].value, (_, state) => {
      ioDevice.output[pos].locker = false
      ioDevice.output[pos].value = state
    })

    /* send control via socketIo */
    socketIo.value.emit('control_io', _io)
  }
}

socketIo.value.on(`device/${props.device.id}/input-io`, (data: PayloadIo) => {
  console.log('data: ', data)

  if (data?.data) {
    const { mode, pos, state } = data.data
    if (mode === 'all') {
      ioInAll.value = state
    } else {
      if (pos >= 0) {
        ioDevice.input[pos].value = state
      }
    }
  }
})

socketIo.value.on(`device/${props.device.id}/output-io`, (data: PayloadIo) => {
  console.log('data: ', data)
  if (data && data.data._ack) {
    const _ack = data.data._ack
    const _ackNum = parseInt(_ack)
    const _ackCached = getAckWait(_ackNum)

    if (_ackCached) {
      const pos = _ackCached.pos
      if (pos === -1) {
        ioOutAll.locker = false
        changeAllSwitchState() // apply all switch single follow by switch general
      } else {
        ioDevice.output[pos].locker = false
        checkSwitchAll()
      }
      removeAckWait(_ackNum)
    }
  }
})

api
  .get(`/device/io?id=${props.device.id}`)
  .then((res) => {
    const _data = res.data as ListIoInfo
    if (_data.code === '107002') {
      ioDevice.input = _data.info.input.map((item) => ({ ...item, locker: false }))
      ioDevice.output = _data.info.output.map((item) => ({ ...item, locker: false }))

      /* check all switch */
      checkSwitchAll()
    }
  })
  .catch((error) => {
    console.log(error)
  })

onUnmounted(() => {
  socketIo.value.off(`device/${props.device.id}/input-io`)
  socketIo.value.off(`device/${props.device.id}/output-io`)

  /* clean watcher */
  unWatch()
})
</script>

<style scoped></style>
