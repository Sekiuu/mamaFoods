<script setup lang="ts">
import * as v from 'valibot'
import type { FoodItem } from '#shared/types'
import { useDriveImage } from '~/composables/useDriveImage'
import type { FoodOption, FoodOptionChoice } from '#shared/types/foods'

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
      options: typeof props.editingFood.options === 'string' ? JSON.parse(props.editingFood.options) : props.editingFood.options,
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
  if (!formData.value.options || formData.value.options.length === 0) return
  localStorage.setItem(OPTION_CLIPBOARD_KEY, JSON.stringify(formData.value.options))
  toast.add({ title: 'Options copied to clipboard', color: 'success', icon: 'i-lucide-copy' })
}

const pasteOptions = () => {
  const saved = localStorage.getItem(OPTION_CLIPBOARD_KEY)
  if (!saved) {
    toast.add({ title: 'No options found in clipboard', color: 'error', icon: 'i-lucide-clipboard-x' })
    return
  }
  try {
    const parsed = JSON.parse(saved)
    formData.value.options = [...(formData.value.options || []), ...parsed]
    toast.add({ title: 'Options pasted successfully', color: 'success', icon: 'i-lucide-clipboard-check' })
  } catch (e) {}
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
        <UTextarea v-model="formData.description" :placeholder="$t('admin.food.description')" :rows="4"
          class="w-full" />
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

      <!-- Options Editor -->
      <div class="pt-4 space-y-3">
        <UCard v-for="(option, index) in formData.options ?? []" :key="index" :ui="{ body: 'p-4' }">
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <UFormField :label="$t('admin.food.optionName')" required>
                <UInput v-model="option.name" :placeholder="$t('admin.food.optionName')" />
              </UFormField>
              <UButton icon="i-lucide-trash" color="error" variant="ghost" size="sm" class="mt-7"
                @click="formData.options?.splice(index, 1)" />
            </div>

            <div>
              <UFormField :label="$t('admin.food.description')">
                <UInput v-model="option.description" :placeholder="$t('admin.food.description')" />
              </UFormField>
              <UFormField :label="$t('admin.food.optionType') || 'Selection Type'">
                <USelect v-model="option.type"
                  :items="[{ label: 'Single Choice', value: 'single' }, { label: 'Multiple Choice', value: 'multiple' }]" />
              </UFormField>
              <div class="flex items-center h-full pt-6">
                <UCheckbox v-model="option.required" :label="$t('admin.food.required') || 'Required Group'" />
              </div>
            </div>

            <!-- Nested Choices Editor -->
            <div class="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl space-y-3 divide-default divide-y-4">
              <div class="flex items-center justify-between">
                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {{ $t('admin.food.choices') }}
                </p>
                <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="primary"
                  @click="(option.choices as FoodOptionChoice[]).push({ name: '', price: 0, default: false })">
                  {{ $t('admin.food.addChoice') }}
                </UButton>
              </div>

              <div v-if="!(option.choices as FoodOptionChoice[]).length"
                class="text-center py-4 text-xs text-muted italic">
                {{ $t('admin.food.noChoices') }}
              </div>

              <div v-for="(choice, cIndex) in (option.choices as FoodOptionChoice[])" :key="cIndex"
                class="flex items-start justify-between gap-4">
                <div class=" space-y-4">
                  <UFormField :label="`${$t('admin.food.choices')} ${cIndex + 1}`" class="mb-0">
                    <UInput v-model="choice.name" :placeholder="$t('admin.food.choiceName')" size="sm" />
                  </UFormField>
                  <UFormField :label="$t('admin.food.price')" class="mb-0">
                    <UInput v-model="choice.price" type="number" :placeholder="$t('admin.food.price')" size="sm" />
                  </UFormField>
                </div>
                <div class="flex items-end gap-2 mt-2 flex-col">
                  <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs"
                    @click="(option.choices as FoodOptionChoice[]).splice(cIndex, 1)" />
                  <UCheckbox v-model="choice.default" :label="$t('admin.food.setOptionDefault')" @update:model-value="(val) => {
                    if (val && option.type === 'single') {
                      (option.choices as FoodOptionChoice[]).forEach((c, i) => {
                        if (i !== cIndex) c.default = false
                      })
                    }
                  }" />
                </div>
              </div>
            </div>
          </div>
        </UCard>
        <!-- No options -->
        <div v-if="!formData.options?.length" class="text-muted text-sm">
          {{ $t('admin.food.noOptions') }}
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton type="button" color="success" variant="soft" icon="i-lucide-plus" @click="
            formData.options ??= formData.options || [];
          formData.options.push({ name: '', description: '', type: 'single', required: false, choices: [] })
            ">
            {{ $t('admin.food.addOption') }}
          </UButton>
          <UButton type="button" color="neutral" variant="outline" icon="i-lucide-copy"
            :disabled="!formData.options?.length" @click="copyOptions">
            {{ $t('btn.copy') || 'Copy' }}
          </UButton>
          <UButton type="button" color="neutral" variant="outline" icon="i-lucide-clipboard" @click="pasteOptions">
            {{ $t('btn.paste') || 'Paste' }}
          </UButton>
        </div>
      </div>
    </UForm>
    <UAlert v-if="errorMessage" color="error" variant="soft" icon="i-lucide-circle-x" :description="errorMessage"
      class="mt-4" close @update:open="errorMessage = ''" />
    <UAlert v-if="successMessage" color="success" variant="soft" icon="i-lucide-circle-check"
      :description="successMessage" class="mt-4" close @update:open="successMessage = ''" />
  </UCard>
</template>
