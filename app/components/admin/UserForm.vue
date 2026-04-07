<template>
  <div class="user-form-container">
    <h2 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit User" : "Add New User" }}
    </h2>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Name<span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Enter user name"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Password
          <span v-if="!isEditing" class="text-red-500">*</span>
          <span v-else class="text-gray-500 text-xs">(leave blank to keep)</span>
        </label>
        <input
          v-model="formData.password"
          type="password"
          placeholder="Enter password"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :required="!isEditing"
          autocomplete="new-password"
        />
      </div>

      <div class="flex gap-4 pt-4">
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          {{ isLoading ? "Loading..." : isEditing ? "Update" : "Create" }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UserItem } from '../../types'

interface FormData {
  name: string
  password: string
}

const props = defineProps<{
  editingUser?: UserItem | null
}>()

const emit = defineEmits<{
  'user-created': []
  'user-updated': []
  clear: []
}>()

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEditing = ref(false)

const formData = ref<FormData>({
  name: '',
  password: '',
})

const resetForm = () => {
  formData.value = { name: '', password: '' }
  isEditing.value = false
  errorMessage.value = ''
  successMessage.value = ''
  emit('clear')
}

const loadEditingUser = () => {
  if (props.editingUser) {
    formData.value = {
      name: props.editingUser.name || '',
      password: '',
    }
    isEditing.value = true
  }
}

const submitForm = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isEditing.value && props.editingUser?.id) {
      await $fetch(`/api/users/${props.editingUser.id}`, {
        method: 'PUT',
        body: {
          name: formData.value.name,
          password: formData.value.password || undefined,
        },
      })
      successMessage.value = 'User updated successfully!'
      emit('user-updated')
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: {
          name: formData.value.name,
          password: formData.value.password,
        },
      })
      successMessage.value = 'User created successfully!'
      emit('user-created')
    }

    resetForm()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.editingUser,
  () => {
    if (props.editingUser) loadEditingUser()
  }
)
</script>

<style scoped>
.user-form-container {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
</style>

