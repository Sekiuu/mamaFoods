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
  <UHeader to="#" :title="title">
    <template #right>
      <slot name="actions" />
      <UButton v-if="enableBack" to="/dashboard" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-4">
        {{ $t('admin.header.back') }}
      </UButton>
      <UButton v-if="enableLogout" color="error" icon="i-lucide-log-out" :loading="processing" @click="handleLogout">
        {{ $t('admin.header.logout') }}
      </UButton>
    </template>
  </UHeader>
</template>
