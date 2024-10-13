import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/AccountPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  /* check is auth */
  let isAuth = true

  /* if no token found */
  if (!authStore.runtimeToken || !authStore.refreshToken) {
    isAuth = false
  }

  if (to.name !== 'Account' && isAuth === false) {
    next({ name: 'Account' })
  } else if (isAuth) {
    /* dispatch check token */
    authStore.runCheckRefreshToken()

    /* redirect to home if user attempt to login */
    if (to.name === 'Account') {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
