<template>
  <p class="text-sm mb-2">
    <span>Device is</span>
    <span
      class="ml-2 px-2 rounded shadow-sm"
      :class="props.status ? 'bg-green-500 shadow-green-500' : 'bg-slate-500 shadow-slate-500'"
    >
      {{ props.status ? 'online' : 'offline' }}
    </span>
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: boolean
}>()
</script>

<style scoped></style>
