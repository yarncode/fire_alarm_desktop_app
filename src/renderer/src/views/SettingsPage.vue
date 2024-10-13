<template>
  <div class="h-full">
    <n-card class="h-full">
      <template #header>
        <p class="text-sm flex items-center">
          <!-- <i class="fi fi-rr-temperature-high leading-none"></i> -->
          <span class="">Main Setings</span>
        </p>
      </template>
      <n-space class="w-1/2" vertical size="large">
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NCard, NSpace, NForm, NFormItem, NSelect, SelectOption } from 'naive-ui'

import { useAudioStore } from '../store/audio'

const _audio = useAudioStore()

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
}>({
  speakerId: localStorage.getItem('speakerId') || undefined
})

const handleUpdateOutputAudio = (value: string, option: SelectOption) => {
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
</script>
