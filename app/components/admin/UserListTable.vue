<template>
  <div class="user-list-container">
    <h2 class="text-2xl font-bold mb-4">Users</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border-collapse border border-gray-300">
        <thead class="bg-gray-200">
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Created</th>
            <th class="border border-gray-300 px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="4" class="border border-gray-300 px-4 py-2 text-center text-gray-500">
              No users found
            </td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-100">
            <td class="border border-gray-300 px-4 py-2">{{ user.id }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ user.name }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ formatDate(user.create_at) }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center space-x-2">
              <button @click="$emit('edit', user)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                Edit
              </button>
              <button
                @click="$emit('delete', user.id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserItem } from '../../types'

defineProps<{
  users: UserItem[]
}>()

defineEmits<{
  edit: [user: UserItem]
  delete: [id: number]
}>()

const formatDate = (value: UserItem['create_at']) => {
  if (!value) return '-'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}
</script>

<style scoped>
.user-list-container {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}
</style>

