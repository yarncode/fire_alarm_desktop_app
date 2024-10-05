<template>
  <wrap-provider>
    <n-layout has-sider class="h-screen">
      <n-layout-sider v-if="$route.name !== 'Account'" bordered show-trigger="bar">
        <menu-side />
      </n-layout-sider>
      <n-layout>
        <n-layout-content class="h-full px-10 py-5">
          <!-- main content -->
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
import { NLayout, NLayoutSider, NLayoutContent } from 'naive-ui'

import WrapProvider from './components/WrapProvider.vue'
import MenuSide from './components/MenuSide.vue'
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
