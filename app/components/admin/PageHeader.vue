<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
        <div class="flex space-x-4">
          <slot name="actions">
          </slot>
          <button
            v-if="enableLogout"
            @click="handleLogout"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  enableLogout: boolean
}

defineProps<Props>()

const { logout } = useAdminAuth()

const handleLogout = () => {
  logout()
}
</script>