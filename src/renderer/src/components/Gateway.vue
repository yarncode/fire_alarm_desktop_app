<template>
  <n-tabs class="" type="segment" animated>
    <n-tab-pane name="data-log" tab="Control">
      <c-control :device="{ id: props.device.id, name: props.device.name }" />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import CControl from '@renderer/components/Control.vue'
import { InfoDevice } from '@renderer/interface/device'

const props = defineProps<{
  device: InfoDevice
}>()
</script>

<style scoped></style>
