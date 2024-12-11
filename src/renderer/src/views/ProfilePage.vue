<template>
  <div class="h-full">
    <n-card class="h-full">
      <template #header>
        <p class="text-sm flex items-center">
          <!-- <i class="fi fi-rr-temperature-high leading-none"></i> -->
          <span class="ml-2">User Profile</span>
        </p>
      </template>
      <n-space class="w-1/2" vertical size="large">
        <lottie-player class="!w-20 !mx-0" :animation-data="_urlProfileIcon"> </lottie-player>
        <n-form
          ref="formRef"
          :label-width="80"
          :model="formValue"
          :rules="rules"
          size="large"
          style="margin: 1rem 0"
        >
          <n-form-item label="UUID" path="id">
            <n-input
              v-model:value="formValue.id"
              clearable
              type="text"
              disabled
              placeholder="example: {id}"
            />
          </n-form-item>
          <n-form-item label="Email" path="email">
            <n-input
              v-model:value="formValue.email"
              clearable
              type="text"
              placeholder="example: {email}"
              disabled
            />
          </n-form-item>
          <n-form-item label="Username" path="username">
            <n-input
              v-model:value="formValue.username"
              clearable
              type="text"
              placeholder="example: {username}"
              disabled
              />
          </n-form-item>
          <n-form-item label="Name" path="name">
            <n-input
              v-model:value="formValue.name"
              clearable
              type="text"
              placeholder="example: {name}"
              disabled
            />
          </n-form-item>
          <n-form-item label="Description" path="desc">
            <n-input
              v-model:value="formValue.desc"
              clearable
              type="textarea"
              placeholder="example: {description}"
              disabled
            />
          </n-form-item>
        </n-form>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { NCard, NInput, NSpace, NForm, NFormItem } from 'naive-ui'
import _urlProfileIcon from '../assets/icon/lottie/profile.json'

import { useProfileStore } from '../store/profile'

const { id, username, name, email, avatar_url, desc } = useProfileStore()

const rules = {
  // email: {
  //   required: true,
  //   trigger: 'blur',
  //   validator: validateEmail
  // }
}

const formValue = reactive({
  id,
  username,
  name,
  email,
  avatar_url,
  desc
})

</script>
