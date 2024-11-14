import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSocketStore } from '../store/socket'
import { useSettingStore } from '../store/setting'
// import { useDialog } from 'naive-ui'

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

router.beforeEach(async (to, _, next) => {
  const { isAuth, activeRunnerCheckToken } = useAuthStore()
  const { socketIo, setupSocket, connect } = useSocketStore()
  const { server } = useSettingStore()

  /* check is auth */
  let _isAuth = true

  /* if no token found */
  if (isAuth() === false) {
    _isAuth = false
  }

  if (to.name !== 'Account' && _isAuth === false) {
    next({ name: 'Account' })
  } else if (_isAuth) {
    activeRunnerCheckToken()
      .then(() => {
        /* start socket client */
        if (socketIo.disconnected) {
          setupSocket(server.hostName, server.portSocket)
          connect()
        }
      })
      .catch(() => {})

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
