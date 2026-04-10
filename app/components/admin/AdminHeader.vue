<template>
  <UHeader :title="title">
    <template #right>
      <slot name="actions" />
      <UButton v-if="enableLogout" color="error" icon="i-lucide-log-out" :loading="processing" @click="handleLogout">
        Logout
      </UButton>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

defineProps<{
  title: string
  enableLogout: boolean
}>()

const { logout } = useAuth()
const processing = ref(false)

const handleLogout = async () => {
  processing.value = true
  try {
    await logout()
    navigateTo('/admin/login')
  } catch (err) {
    console.log(err)
  } finally {
    processing.value = false
  }
}
</script>
