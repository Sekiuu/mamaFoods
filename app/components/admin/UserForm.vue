<template>
  <UCard>
    <template #header>
      <h1 class="text-3xl">{{ isEditing ? 'Edit User' : 'Create User' }}</h1>
    </template>

    <UForm :schema="schema" :state="formData" class="space-y-4" @submit="submitForm">
      <UFormField label="Name" name="name" required>
        <UInput v-model="formData.name" type="text" placeholder="Enter user name" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password" :hint="isEditing ? '(leave blank to keep)' : undefined"
        :required="!isEditing">
        <UInput v-model="formData.password" type="password" placeholder="Enter password" autocomplete="new-password"
          class="w-full" />
      </UFormField>

      <UFormField label="Role" name="role" :required="!isEditing">
        <USelect v-model="formData.role" :items="roles" placeholder="Select role" class="w-full" />
      </UFormField>

      <div class="flex gap-4 pt-4">
        <UButton type="submit" color="success" :loading="isLoading">
          {{ isEditing ? 'Update' : 'Create' }}
        </UButton>
        <UButton type="button" color="neutral" variant="soft" @click="resetForm">
          Clear
        </UButton>
      </div>
    </UForm>

    <UAlert v-if="errorMessage" color="error" variant="soft" icon="i-lucide-circle-x" :description="errorMessage"
      class="mt-4" close @update:open="errorMessage = ''" />
    <UAlert v-if="successMessage" color="success" variant="soft" icon="i-lucide-circle-check"
      :description="successMessage" class="mt-4" close @update:open="successMessage = ''" />
  </UCard>
</template>

<script setup lang="ts">
import type { UserItem } from '../../types'
import { roles, Role } from '~/types/users'
import * as v from 'valibot'

const schema = computed(() =>
  v.object({
    name: v.pipe(v.string(), v.minLength(3, 'Name must be at least 3 characters long.')),
    password: isEditing.value
      ? v.union([
          v.literal(''),
          v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters long.')),
        ])
      : v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters long.')),
    role: v.optional(v.string()),
  })
)


interface FormData {
  name: string
  password: string
  role: Role.ADMIN | Role.OPERATOR | Role.CUSTOMER
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
  role: Role.OPERATOR,
})

const resetForm = () => {
  formData.value = { name: '', password: '', role: Role.OPERATOR }
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
      role: props.editingUser.role || Role.CUSTOMER,
    }
    console.log(props.editingUser)
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
          role: formData.value.role || '',
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
          role: formData.value.role || '',
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
