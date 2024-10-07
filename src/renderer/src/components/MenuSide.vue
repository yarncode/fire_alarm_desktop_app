<template>
  <n-list clickable hoverable>
    <n-list-item
      v-for="item in listMenu"
      v-show="$route.name !== item.nameRoute"
      :key="item.label"
      @click="handleItemClick(item)"
    >
      <div class="flex justify-start">
        <component
          :is="'i'"
          :class="item.icon"
          class="mr-2 items-center leading-none mt-0.5"
        ></component>
        <span>{{ item.label }}</span>
      </div>
    </n-list-item>
  </n-list>
</template>

<script setup lang="ts">
import { NList, NListItem, useDialog } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

import { useAuthStore } from '../store/auth'

type MenuItemType = 'route' | 'action'

interface MenuItemCustom {
  type: MenuItemType
  label: string
  nameRoute?: string
  icon: unknown | string
  action?: () => void
}
/* constants variables */
let presentTitle = ''

/* const ref variables */
const router = useRouter()
const route = useRoute()
const dialog = useDialog()
const authStore = useAuthStore()
const listMenu: Array<MenuItemCustom> = [
  {
    label: 'Home',
    type: 'route',
    nameRoute: 'Home',
    icon: 'fi fi-rr-house-blank'
  },
  {
    label: 'Profile',
    type: 'route',
    nameRoute: 'Profile',
    icon: 'fi fi-rr-user'
  },
  {
    label: 'Logout',
    type: 'action',
    icon: 'fi fi-ts-arrow-left-from-arc',
    action() {
      /* do something here */
      dialog.warning({
        title: 'Confirm',
        content: 'Are you sure logout?',
        positiveText: 'Sure',
        negativeText: 'Cancel',
        onPositiveClick: () => {
          authStore.logout()
          router.push({ name: 'Account' })
        },
        onNegativeClick: () => {}
      })
    }
  }
]
const mainTitle = computed(() => {
  const existNameRoute = listMenu.find((item) => item?.nameRoute === route.name)
  if (existNameRoute) {
    presentTitle = existNameRoute.label
    return existNameRoute.label
  }
  return presentTitle
})

const handleItemClick = (menu: MenuItemCustom) => {
  if (menu.type === 'action') {
    if (menu?.action) {
      menu.action()
    }
  } else if (menu.type === 'route' && menu?.nameRoute) {
    router.push({ name: menu.nameRoute })
  }
}
</script>

<style scoped></style>
