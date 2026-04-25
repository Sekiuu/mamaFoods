<script setup lang="ts">
import * as v from 'valibot'
import { useDriveImage } from '~/composables/useDriveImage'
import type { FoodOption, FoodOptionChoice, FoodItem } from '#shared/types/foods'

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
  options?: FoodOption[] | null
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
const toast = useToast()
const isEditing = ref(false)

const formData = ref<FormData>({
  name: '',
  price: '',
  description: '',
  icon: '',
  show: true,
  options: null,
})

const resetForm = () => {
  formData.value = { name: '', price: '', description: '', icon: '', show: true, options: null }
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
      options:
        typeof props.editingFood.options === 'string'
          ? (JSON.parse(props.editingFood.options) as FoodOption[])
          : props.editingFood.options,
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

const OPTION_CLIPBOARD_KEY = 'mamaFood_option_clipboard'

const copyOptions = () => {
  if (!formData.value.options?.length) return
  localStorage.setItem(OPTION_CLIPBOARD_KEY, JSON.stringify(formData.value.options))
  toast.add({ title: 'Options copied!', color: 'success', icon: 'i-lucide-copy' })
}

const pasteOptions = () => {
  const saved = localStorage.getItem(OPTION_CLIPBOARD_KEY)
  if (!saved) {
    toast.add({ title: 'No options in clipboard', color: 'error', icon: 'i-lucide-clipboard-x' })
    return
  }
  try {
    const parsed = JSON.parse(saved)
    formData.value.options = [...(formData.value.options || []), ...parsed]
    toast.add({ title: 'Options pasted!', color: 'success', icon: 'i-lucide-clipboard-check' })
  } catch { }
}

const addOption = () => {
  formData.value.options ??= []
  formData.value.options.push({ name: '', description: '', type: 'single', required: false, choices: [] })
}

const addChoice = (option: FoodOption) => {
  ; (option.choices as FoodOptionChoice[]).push({ name: '', price: 0, default: false })
}

const currentImage = ref(null as File | null)
const isUploadingImage = ref(false)
const uploadImage = async (file: File) => {
  if (!file) return
  console.log('Uploading image:', file.name, file.size, file.type);
  isUploadingImage.value = true
  try {
    const body = new FormData()
    body.append('file', file)

    const response = await fetch('/api/foods/images', {
      method: 'POST',
      body: body,
    })
    const data = await response.json()
    formData.value.icon = data.url // Set the icon to the new image URL

    // Clear the current image
    currentImage.value = null
    // Show success toast
    toast.add({ title: 'Image uploaded!', color: 'success', icon: 'i-lucide-check' })
    // update data base of food
    await submitForm()
  } catch (error : any) {
    console.error('Error uploading image:', error);
    toast.add({
      title: 'Image upload failed', color: 'error', icon: 'i-lucide-x',
      description: error.message || 'An error occurred while uploading the image.'
    })
    return ''
  }
  finally {
    isUploadingImage.value = false
  }
}

onMounted(() => {
  if (props.editingFood) loadEditingFood()
})

watch(
  () => props.editingFood,
  () => {
    if (props.editingFood) loadEditingFood()
  }
)
</script>

<template>
  <UCard :ui="{ root: 'flex flex-col gap-0 overflow-visible' }">
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl"
          :class="isEditing ? 'bg-warning-100 dark:bg-warning-900' : 'bg-primary-100 dark:bg-primary-900'">
          <UIcon :name="isEditing ? 'i-lucide-pencil' : 'i-lucide-utensils'" class="size-5"
            :class="isEditing ? 'text-warning-600' : 'text-primary-600'" />
        </div>
        <div>
          <h2 class="text-lg font-bold leading-tight">
            {{ isEditing ? $t('admin.food.edit') : $t('admin.food.create') }}
          </h2>
          <p class="text-xs text-muted">
            {{ isEditing ? `Editing: ${props.editingFood?.name}` : 'Fill in the details below' }}
          </p>
        </div>
        <UButton v-if="isEditing" icon="i-lucide-x" size="xs" color="neutral" variant="ghost" class="ml-auto"
          @click="resetForm" />
      </div>
    </template>

    <UForm :schema="schema" :state="formData" class="space-y-6" @submit="submitForm">

      <!-- ── Basic Info Section ── -->
      <div class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
          <UIcon name="i-lucide-info" class="size-3.5" /> Basic Info
        </p>

        <!-- Image Preview + Icon Input -->
        <div class="flex gap-4 items-start">

          <div v-if="!currentImage"
            class="shrink-0 size-24 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-default flex items-center justify-center">
            <img v-if="formData.icon" :src="formData.icon" :alt="formData.name" class="object-cover w-full h-full"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
            <UIcon v-else name="i-lucide-image" class="size-8 text-muted content-center" />

          </div>
          <UFileUpload v-model="currentImage" accept="image/*" :disabled="isUploadingImage" class="aspect-square" />
          <UFormField name="icon">
            <UInput v-model="formData.icon" :placeholder="$t('admin.food.icon')" icon="i-lucide-link" class="w-full"
              :disabled="isUploadingImage" />

            <UButton v-if="currentImage" icon="i-lucide-upload" :label="$t('btn.upload.image')" color="primary"
              variant="outline" class="mt-2" @click="uploadImage(currentImage)" :loading="isUploadingImage" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="$t('admin.food.name')" name="name" required class="col-span-2 sm:col-span-1">
            <UInput v-model="formData.name" :placeholder="$t('admin.food.name')" icon="i-lucide-utensils"
              class="w-full" />
          </UFormField>
          <UFormField :label="$t('food.price')" name="price" required class="col-span-2 sm:col-span-1">
            <UInput v-model="formData.price" :placeholder="$t('food.price')" icon="i-lucide-banknote" class="w-full" />
          </UFormField>
        </div>

        <UFormField :label="$t('admin.food.description')" name="description">
          <UTextarea v-model="formData.description" :placeholder="$t('admin.food.description')" :rows="3"
            class="w-full" />
        </UFormField>

        <!-- Visibility Toggle -->
        <div
          class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-default">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-eye" class="size-4 text-muted" />
            <div>
              <p class="text-sm font-medium">{{ $t('admin.food.show') }}</p>
              <p class="text-xs text-muted">Visible to customers in the menu</p>
            </div>
          </div>
          <USwitch v-model="formData.show" color="success" />
        </div>
      </div>

      <USeparator />

      <!-- ── Options Section ── -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
            <UIcon name="i-lucide-sliders-horizontal" class="size-3.5" /> Options
            <UBadge v-if="formData.options?.length" :label="String(formData.options.length)" color="primary"
              variant="subtle" size="sm" />
          </p>
          <div class="flex gap-1.5">
            <UTooltip text="Copy options">
              <UButton icon="i-lucide-copy" size="xs" color="neutral" variant="outline"
                :disabled="!formData.options?.length" @click="copyOptions" />
            </UTooltip>
            <UTooltip text="Paste options">
              <UButton icon="i-lucide-clipboard" size="xs" color="neutral" variant="outline" @click="pasteOptions" />
            </UTooltip>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!formData.options?.length"
          class="border-2 border-dashed border-default rounded-2xl p-8 text-center space-y-2">
          <UIcon name="i-lucide-list-plus" class="size-8 text-muted mx-auto" />
          <p class="text-sm text-muted">{{ $t('admin.food.noOptions') }}</p>
          <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="addOption">
            {{ $t('admin.food.addOption') }}
          </UButton>
        </div>

        <!-- Option Cards -->
        <div v-else class="space-y-3">
          <UCard v-for="(option, index) in formData.options" :key="index"
            :ui="{ root: 'border-l-4 border-l-primary-400', body: 'p-4 space-y-4' }">
            <!-- Option Header -->
            <div class="flex items-start gap-3">
              <div class="flex-1 grid grid-cols-2 gap-3">
                <UFormField :label="$t('admin.food.optionName')" required>
                  <UInput v-model="option.name" :placeholder="$t('admin.food.optionName')" size="sm" class="w-full" />
                </UFormField>
                <UFormField :label="$t('admin.food.optionType') || 'Type'">
                  <USelect v-model="option.type" size="sm" :items="[
                    { label: 'Single choice', value: 'single' },
                    { label: 'Multiple choice', value: 'multiple' },
                  ]" class="w-full" />
                </UFormField>
              </div>
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" class="mt-6 shrink-0"
                @click="formData.options?.splice(index, 1)" />
            </div>

            <div class="flex items-center gap-4">
              <UFormField :label="$t('admin.food.description')" class="flex-1">
                <UInput v-model="option.description" :placeholder="$t('admin.food.description')" size="sm"
                  class="w-full" />
              </UFormField>
              <div class="flex items-center gap-2 pt-5">
                <UCheckbox v-model="option.required" size="sm" :label="$t('admin.food.required') || 'Required'" />
              </div>
            </div>

            <!-- Choices -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-3 space-y-2">
              <div class="flex items-center justify-between mb-1">
                <p class="text-xs font-semibold text-muted uppercase tracking-wider">
                  {{ $t('admin.food.choices') }}
                  <span class="ml-1 text-primary-500">({{ (option.choices as FoodOptionChoice[]).length }})</span>
                </p>
                <UButton icon="i-lucide-plus" size="xs" variant="soft" color="primary" @click="addChoice(option)">
                  {{ $t('admin.food.addChoice') }}
                </UButton>
              </div>

              <div v-if="!(option.choices as FoodOptionChoice[]).length"
                class="text-center py-3 text-xs text-muted italic">
                {{ $t('admin.food.noChoices') }}
              </div>

              <div v-for="(choice, cIndex) in (option.choices as FoodOptionChoice[])" :key="cIndex"
                class="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-default">
                <div class="flex-1 grid grid-cols-2 gap-2">
                  <UInput v-model="choice.name" :placeholder="$t('admin.food.choiceName')" size="xs" />
                  <UInput v-model="choice.price" type="number" placeholder="฿ Price" size="xs"
                    icon="i-lucide-plus-circle" />
                </div>
                <UTooltip :text="$t('admin.food.setOptionDefault')">
                  <UCheckbox v-model="choice.default" @update:model-value="(val: any) => {
                    if (val && option.type === 'single') {
                      (option.choices as FoodOptionChoice[]).forEach((c, i) => {
                        if (i !== cIndex) c.default = false
                      })
                    }
                  }" />
                </UTooltip>
                <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs"
                  @click="(option.choices as FoodOptionChoice[]).splice(cIndex, 1)" />
              </div>
            </div>
          </UCard>

          <UButton type="button" color="primary" variant="soft" icon="i-lucide-plus" block @click="addOption">
            {{ $t('admin.food.addOption') }}
          </UButton>
        </div>
      </div>

      <!-- ── Alerts ── -->
      <UAlert v-if="errorMessage" color="error" variant="soft" icon="i-lucide-circle-x" :description="errorMessage"
        close @update:open="errorMessage = ''" />
      <UAlert v-if="successMessage" color="success" variant="soft" icon="i-lucide-circle-check"
        :description="successMessage" close @update:open="successMessage = ''" />

      <!-- ── Submit Actions ── -->
      <div class="flex items-center gap-3 pt-2">
        <UButton type="submit" :color="isEditing ? 'warning' : 'success'"
          :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus-circle'" :loading="isLoading" class="flex-1">
          {{ isEditing ? $t('admin.food.updateBtn') : $t('admin.food.createBtn') }}
        </UButton>
        <UButton type="button" color="neutral" variant="soft" icon="i-lucide-rotate-ccw" @click="resetForm">
          {{ $t('admin.food.clearBtn') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>