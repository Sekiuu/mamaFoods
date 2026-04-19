<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-bold">
        {{ isEditing ? $t('admin.food.edit') : $t('admin.food.create') }}
      </h2>
    </template>

    <UForm :schema="schema" :state="formData" class="space-y-4" @submit="submitForm">
      <UFormField :label="$t('admin.food.name')" name="name" required>
        <UInput v-model="formData.name" :placeholder="$t('admin.food.name')" class="w-full" />
      </UFormField>

      <UFormField :label="$t('food.price')" name="price" required>
        <UInput v-model="formData.price" :placeholder="$t('food.price')" class="w-full" />
      </UFormField>

      <UFormField :label="$t('admin.food.description')" name="description">
        <UTextarea v-model="formData.description" :placeholder="$t('admin.food.description')" :rows="4" class="w-full" />
      </UFormField>

      <UFormField :label="$t('admin.food.icon')" name="icon">
        <UInput v-model="formData.icon" :placeholder="$t('admin.food.icon')" class="w-full" />
      </UFormField>

      <div class="flex gap-4 pt-4">
        <UButton type="submit" color="success" :loading="isLoading">
          {{ isEditing ? $t('admin.food.updateBtn') : $t('admin.food.createBtn') }}
        </UButton>
        <UButton type="button" color="neutral" variant="soft" @click="resetForm">
          {{ $t('admin.food.clearBtn') }}
        </UButton>
        <UCheckbox v-model="formData.show" :label="$t('admin.food.show')" />
      </div>
    </UForm>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-circle-x"
      :description="errorMessage"
      class="mt-4"
      close
      @update:open="errorMessage = ''"
    />
    <UAlert
      v-if="successMessage"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      :description="successMessage"
      class="mt-4"
      close
      @update:open="successMessage = ''"
    />
  </UCard>
</template>

<script setup lang="ts">
import * as v from 'valibot'
import type { FoodItem } from '../../types'
import { useDriveImage } from '~/composables/useDriveImage'

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Food name is required.')),
  price: v.pipe(v.string(), v.minLength(1, 'Price is required.')),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
})

interface FormData {
  name: string
  price: string
  description: string
  icon: string
  show: boolean
}

const props = defineProps<{
  editingFood?: FoodItem | null
}>()

const emit = defineEmits<{
  'food-created': []
  'food-updated': []
}>()

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEditing = ref(false)

const formData = ref<FormData>({
  name: '',
  price: '',
  description: '',
  icon: '',
  show: true,
})

const resetForm = () => {
  formData.value = { name: '', price: '', description: '', icon: '', show: true }
  isEditing.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

const loadEditingFood = () => {
  if (props.editingFood) {
    formData.value = {
      name: props.editingFood.name || '',
      price: props.editingFood.price || '',
      description: props.editingFood.description || '',
      icon: props.editingFood.icon || '',
      show: props.editingFood.show || false,
    }
    isEditing.value = true
  }
}

const { getImageURL } = useDriveImage()

const submitForm = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const iconUrl = await getImageURL(formData.value.icon.trim())
    formData.value.icon = iconUrl

    if (isEditing.value && props.editingFood?.id) {
      await $fetch(`/api/foods/${props.editingFood.id}`, {
        method: 'PUT',
        body: formData.value,
      })
      successMessage.value = $t('admin.food.successUpdate')
      emit('food-updated')
    } else {
      await $fetch('/api/foods', {
        method: 'POST',
        body: formData.value,
      })
      successMessage.value = $t('admin.food.successCreate')
      emit('food-created')
    }

    resetForm()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.editingFood,
  () => {
    if (props.editingFood) loadEditingFood()
  }
)
</script>
