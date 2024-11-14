<template>
  <div class="flex">
    <n-card class="mr-2">
      <template #header>
        <p class="text-sm flex items-center">
          <!-- <i class="fi fi-rr-temperature-high leading-none"></i> -->
          <span class="">Main Settings</span>
        </p>
      </template>
      <n-space vertical size="large">
        <n-form
          ref="formRef"
          :label-width="80"
          :model="formValue"
          :rules="rules"
          size="large"
          style="margin: 1rem 0"
        >
          <n-form-item label="Audio output" path="speakerId">
            <n-select
              v-model:value="formValue.speakerId"
              :options="speakers"
              @update:value="handleUpdateOutputAudio"
            />
          </n-form-item>
        </n-form>
      </n-space>
    </n-card>
    <n-card class="ml-2">
      <template #header>
        <p class="text-sm flex items-center">
          <!-- <i class="fi fi-rr-temperature-high leading-none"></i> -->
          <span class="">Server Settings</span>
        </p>
      </template>
      <n-space vertical class="mt-2">
        <n-input v-model:value="formValue.server.hostName" round type="text" placeholder="domain" />
        <n-input v-model:value="formValue.server.entryPath" round type="text" placeholder="path" />
        <n-input
          v-model:value="formValue.server.apiVersion"
          round
          type="text"
          placeholder="api version"
        />
        <n-input-number v-model:value="formValue.server.portApi" round placeholder="Api port" />
        <n-input-number
          v-model:value="formValue.server.portSocket"
          round
          placeholder="Socket port"
        />
      </n-space>
      <n-space class="mt-5" justify="end">
        <n-button round type="primary" @click="saveServerSetting">
          <template #icon>
            <i class="fi fi-rr-bookmark"></i>
          </template>
          Save
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  useMessage,
  NCard,
  NSpace,
  NForm,
  NFormItem,
  NSelect,
  SelectOption,
  NInput,
  NInputNumber,
  NButton
} from 'naive-ui'

import { useAudioStore } from '../store/audio'
import { useSocketStore } from '../store/socket'
import { useSettingStore, SettingServer } from '@renderer/store/setting'
import { useAuthStore } from '@renderer/store/auth'
import { storeToRefs } from 'pinia'

const message = useMessage()
const _audio = useAudioStore()
const { server } = storeToRefs(useSettingStore())
const { saveServerSetting: changeServerSetting, compareServerSetting } = useSettingStore()

const rules = {
  // email: {
  //   required: true,
  //   trigger: 'blur',
  //   validator: validateEmail
  // }
}

const speakers = ref<SelectOption[]>([])
const formValue = reactive<{
  speakerId: string | undefined
  server: SettingServer
}>({
  speakerId: localStorage.getItem('speakerId') || undefined,
  server: {
    hostName: server.value.hostName,
    entryPath: server.value.apiVersion,
    apiVersion: server.value.entryPath,
    portApi: server.value.portApi,
    portSocket: server.value.portSocket
  }
})

const loadServerSetting = () => {
  /* reload data from store setting */
  formValue.server.hostName = server.value.hostName
  formValue.server.apiVersion = server.value.apiVersion
  formValue.server.entryPath = server.value.entryPath
  formValue.server.portApi = server.value.portApi
  formValue.server.portSocket = server.value.portSocket
}

const saveServerSetting = () => {
  const settingState = compareServerSetting(formValue.server)

  if (settingState) {
    /* save server setting */
    changeServerSetting(formValue.server)

    /* goto change socket */
    const { connect, setupSocket } = useSocketStore()
    const { activeRunnerCheckToken, hasRunnerCheckToken, stopLoopTokenRefresh } = useAuthStore()

    /* stop token refresh */
    if (hasRunnerCheckToken()) {
      stopLoopTokenRefresh()
    }

    /* active new runner */
    activeRunnerCheckToken()
      .then(() => {
        /* start new socket connection */
        setupSocket(formValue.server.hostName, formValue.server.portSocket)
        connect()
      })
      .catch(() => {})
  }

  /* notify save success */
  message.success('Server information is saved.')
}

const handleUpdateOutputAudio = (value: string, _option: SelectOption) => {
  localStorage.setItem('speakerId', value)
  _audio.setOutputAudio(value)
}

const getSpeakersOutput = async () => {
  const _speakers = await navigator.mediaDevices.enumerateDevices()
  speakers.value = _speakers
    .filter((item) => item.kind === 'audiooutput' && item.deviceId !== 'default')
    .map((item) => ({ label: item.label, value: item.deviceId }))
}

getSpeakersOutput()
loadServerSetting()
</script>
