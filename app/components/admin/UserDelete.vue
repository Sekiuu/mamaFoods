<template>
  <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
      <h2 class="text-xl font-bold text-red-600 mb-4">Delete User</h2>

      <p class="text-gray-700 mb-6">
        Are you sure you want to delete <strong>{{ userName }}</strong>? This action cannot be undone.
      </p>

      <div class="flex gap-4 justify-end">
        <button @click="cancelDelete" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
          Cancel
        </button>
        <button
          @click="confirmDelete"
          :disabled="isDeleting"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
        >
          {{ isDeleting ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserItem } from '../../types'

const props = defineProps<{
  user: UserItem | null
}>()

const emit = defineEmits<{
  'user-deleted': []
  close: []
}>()

const isDeleting = ref(false)
const showDialog = computed(() => props.user !== null)
const userName = computed(() => props.user?.name || 'Unknown')

const cancelDelete = () => emit('close')

const confirmDelete = async () => {
  if (!props.user?.id) return

  isDeleting.value = true
  try {
    await $fetch(`/api/users/${props.user.id}`, { method: 'DELETE' })
    emit('user-deleted')
    emit('close')
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>

