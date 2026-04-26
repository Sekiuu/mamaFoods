<script setup lang="ts">
import { useUserAuth } from '~/composables/useUserAuth'

defineProps<{
  title: string
  enableLogout?: boolean
  enableBack?: boolean
}>()

const { logout } = useUserAuth()
const processing = ref(false)

const handleLogout = async () => {
  processing.value = true
  try {
    await logout()
    navigateTo('/dashboard/login')
  } catch (err) {
    console.log(err)
  } finally {
    processing.value = false
  }
}
</script>
<template>
  <UContainer class="pt-6">
    <div class=" flex max-md:flex-col justify-between items-center mb-2 space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
      <slot name="actions" />
      <UButton v-if="enableBack" to="/dashboard"
        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-4">
        {{ $t('admin.header.back') }}
      </UButton>
      <UButton v-if="enableLogout" color="error" icon="i-lucide-log-out" :loading="processing" @click="handleLogout">
        {{ $t('admin.header.logout') }}
      </UButton>
    </div>
    <USeparator />
  </UContainer>
</template>
