<template>
  <n-space class="h-full" vertical align="center" justify="center">
    <n-form
      ref="formRef"
      :label-width="80"
      :model="formValue"
      :rules="rules"
      size="large"
      style="margin: 1rem 0"
    >
      <n-form-item label="Email" path="email">
        <n-input v-model:value="formValue.email" clearable placeholder="example: abc@gmail.com" />
      </n-form-item>
      <n-form-item label="Password" path="password">
        <n-input
          v-model:value="formValue.password"
          clearable
          placeholder="anything..."
          type="password"
        />
      </n-form-item>
      <n-collapse-transition :show="viewMode === 'register'">
        <n-form-item
          v-show="viewMode === 'register'"
          label="Confirm password"
          path="confirmPassword"
        >
          <n-input
            v-model:value="formValue.confirmPassword"
            clearable
            placeholder="anything..."
            type="password"
          />
        </n-form-item>
      </n-collapse-transition>
      <n-button style="width: 100%; margin-top: 0.5rem" round type="primary" @click="submitForm">
        {{ viewMode === 'login' ? 'Login' : 'Register' }}
      </n-button>
      <n-divider dashed> or </n-divider>
      <n-button
        style="width: 100%; margin-top: 0.5rem"
        round
        type="default"
        @click="viewMode = viewMode === 'login' ? 'register' : 'login'"
      >
        {{ viewMode === 'login' ? 'Register' : 'Login' }}
      </n-button>
    </n-form>
  </n-space>
</template>

<script setup lang="ts">
import {
  NSpace,
  NFormItem,
  NForm,
  NInput,
  useMessage,
  FormInst,
  FormItemRule,
  NButton,
  NCollapseTransition,
  NDivider
} from 'naive-ui'
import { AxiosError } from 'axios'
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

import { AccountResponse } from '../interface/account'
import { useAuthStore } from '../store/auth'

type ViewMode = 'login' | 'register'

interface ResponseLogin extends AccountResponse {
  runtime_token: string
  refresh_token: string
}

/* get globalProperties */
const axios = getCurrentInstance()?.appContext.config.globalProperties.$axios
const formRef = ref<FormInst | null>(null)
const viewMode = ref<ViewMode>('login')

const message = useMessage()
const authStore = useAuthStore()
const formValue = ref({
  email: '',
  password: '',
  confirmPassword: ''
})
const router = useRouter()

const validateEmail = (rule: FormItemRule, value: string) => {
  return new Promise<void>((resolve, reject) => {
    /* regex check email */
    if (value.length == 0) {
      reject(new Error('Email is not empty')) // reject with error message
    }

    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!regex.test(value)) {
      reject(new Error('Email invalid')) // reject with error message
    } else {
      resolve()
    }
  })
}

const validatePassword = (rule: FormItemRule, value: string) => {
  return new Promise<void>((resolve, reject) => {
    console.log(rule)

    if (value.length == 0) {
      reject(new Error('Password is not empty')) // reject with error message
    } else if (value.length > 20 || value.length < 8) {
      reject(new Error('Password must be between 8 and 20 characters'))
    } else if (
      formValue.value.password !== formValue.value.confirmPassword &&
      rule['field'] === 'confirmPassword' &&
      viewMode.value === 'register'
    ) {
      reject(new Error('Confirm password is not match'))
    } else {
      resolve()
    }
  })
}

const rules = {
  email: {
    required: true,
    trigger: 'blur',
    validator: validateEmail
  },
  password: {
    required: true,
    trigger: 'blur',
    validator: validatePassword
  },
  confirmPassword: {
    required: true,
    trigger: 'blur',
    validator: validatePassword
  }
}

const handleLogin = async () => {
  axios
    ?.post('/account/login', {
      email: formValue.value.email,
      password: formValue.value.password
    })
    .then((response) => {
      const payload: ResponseLogin = response?.data
      if (payload.code === '108009') {
        message.success('Login successfully')

        authStore.setToken('refresh_token', payload.refresh_token)
        authStore.setToken('runtime_token', payload.runtime_token)

        router.push({ name: 'Home' })
      }
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        message.error(error.message)
      }
    })
}

const handleRegister = async () => {
  axios
    ?.post('/account/register', {
      email: formValue.value.email,
      password: formValue.value.password
    })
    .then((response) => {
      const payload: ResponseLogin = response?.data
      if (payload.code === '108008') {
        message.success('Register successfully')

        authStore.setToken('refresh_token', payload.refresh_token)
        authStore.setToken('runtime_token', payload.runtime_token)

        router.push({ name: 'Home' })
      }
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        message.error(error.message)
      }
    })
}

const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(async (errors: unknown) => {
      if (errors) {
        message.error('Please insert full information')
        return
      }

      formValue.value.email = formValue.value.email.trim()
      formValue.value.password = formValue.value.password.trim()
      formValue.value.confirmPassword = formValue.value.password.trim()

      if (viewMode.value === 'login') {
        handleLogin()
      } else {
        handleRegister()
      }
    })
  }
}
</script>
