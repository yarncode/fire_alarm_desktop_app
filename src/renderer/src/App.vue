<template>
  <wrap-provider>
    <n-layout has-sider class="h-screen">
      <n-layout-sider v-if="$route.name !== 'Account'" bordered show-trigger="bar">
        <menu-side />
      </n-layout-sider>
      <n-layout>
        <n-layout-content class="h-full px-10 py-5">
          <!-- main content -->
          <!-- <n-button @click="test">Test 1</n-button>
          <n-button @click="test2">Test 2</n-button> -->
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </wrap-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutContent, NButton } from 'naive-ui'

import WrapProvider from './components/WrapProvider.vue'
import MenuSide from './components/MenuSide.vue'

import { useSocketStore } from '@renderer/store/socket'

import { Socket } from 'socket.io-client'
import { onUnmounted } from 'vue'

const { connect, setupSocket, addListener, removeListener, socketIo } = useSocketStore()

const onConnected = (socket: Socket) => {
  console.log('socket connected id: ', socket.id)
}

const onDisconnected = (socket: Socket) => {
  console.log('socket disconnected id: ', socket.id)
}

/* add event */
addListener('connect', onConnected)
addListener('disconnect', onDisconnected)

if (socketIo.disconnected) {
  /* setup socket */
  setupSocket(import.meta.env.VITE_HOST_NAME, import.meta.env.VITE_HOST_SOCKET_PORT)
  /* goto connect */
  connect()
}

onUnmounted(() => {
  removeListener('connect', onConnected)
  removeListener('disconnect', onDisconnected)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
