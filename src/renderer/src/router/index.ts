import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSocketStore } from '../store/socket'
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
  const { isAuth, gotoRefreshToken, isTokenExpired, gotoRefreshTokenWithTime } = useAuthStore()
  const { socketIo, setupSocket, connect } = useSocketStore()

  /* check is auth */
  let _isAuth = true

  /* if no token found */
  if (isAuth() === false) {
    _isAuth = false
  }

  if (to.name !== 'Account' && _isAuth === false) {
    next({ name: 'Account' })
  } else if (_isAuth) {
    /* dispatch check token */
    const _expire = isTokenExpired('runtime_token')

    /* if token is expire */
    if (_expire.state) {
      await gotoRefreshToken()
      /* if token is not expire */
    } else {
      const _expireNum = Math.ceil(_expire.exp)
      console.log('_token expire: ', _expireNum)
      /* goto refresh token after range time */
      gotoRefreshTokenWithTime(gotoRefreshToken, _expireNum * 1000)
    }

    /* start socket client */
    if (socketIo.disconnected) {
      setupSocket(import.meta.env.VITE_HOST_NAME, import.meta.env.VITE_HOST_SOCKET_PORT)
      connect()
    }

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
