<template>
  <n-config-provider :theme="themeConst[themeMode]">
    <n-dialog-provider>
      <n-message-provider>
        <slot> </slot>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NDialogProvider, NMessageProvider, NConfigProvider, darkTheme, lightTheme } from 'naive-ui'
import { useColorMode } from '@vueuse/core'

/* constants variables */
const themeConst = {
  dark: darkTheme,
  light: lightTheme,
  auto: null
}
const { value: themeMode } = useColorMode()
</script>
