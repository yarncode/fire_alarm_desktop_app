<template>
  <n-space>
    <n-float-button
      :show-menu="showModal"
      :right="'10%'"
      :bottom="'10%'"
      shape="circle"
      width="3rem"
      height="3rem"
      menu-trigger="click"
      @update:show-menu="openSetting"
    >
      <n-icon>
        <SettingsOutline />
      </n-icon>
    </n-float-button>
    <n-modal
      v-model:show="showModal"
      class="mx-10 w-1/2"
      preset="card"
      transform-origin="center"
      role="dialog"
      title="Information Host"
      size="small"
      aria-modal="true"
    >
      <n-space vertical class="mt-2">
        <n-input v-model:value="serverSetting.hostName" round type="text" placeholder="domain" />
        <n-input v-model:value="serverSetting.entryPath" round type="text" placeholder="path" />
        <n-input
          v-model:value="serverSetting.apiVersion"
          round
          type="text"
          placeholder="api version"
        />
        <n-input-number v-model:value="serverSetting.portApi" round placeholder="Api port" />
        <n-input-number v-model:value="serverSetting.portSocket" round placeholder="Socket port" />
      </n-space>
      <template #action>
        <div class="flex justify-end">
          <n-button round @click="saveSetting">Save Changes</n-button>
        </div>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import {
  useMessage,
  NInput,
  NFloatButton,
  NButton,
  NIcon,
  NModal,
  NSpace,
  NInputNumber
} from 'naive-ui'
import { SettingsOutline } from '@vicons/ionicons5'
import { ref, reactive } from 'vue'
import { useSettingStore, SettingServer } from '@renderer/store/setting'

const message = useMessage()
const { server } = useSettingStore()

const serverSetting: SettingServer = reactive({
  hostName: server.hostName,
  apiVersion: server.apiVersion,
  entryPath: server.entryPath,
  portApi: server.portApi,
  portSocket: server.portSocket
})

console.log(serverSetting)

const showModal = ref(false)

const openSetting = () => {
  showModal.value = true
}

const saveSetting = () => {}
</script>

<style scoped></style>
