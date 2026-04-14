<script setup>
const loading = ref(false)
const error = ref('')

const { t } = useI18n()
const { signin: signIn } = useUserAuth()

const fields = [
  {
    name: 'name',
    type: 'text',
    label: t('admin.login.username'),
    placeholder: t('admin.login.username'),
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: t('admin.login.password'),
    placeholder: t('admin.login.password'),
    required: true
  }
]

const login = async ({ data }) => {
  loading.value = true
  error.value = ''
  try {
    await signIn(data.name, data.password)
    console.log('Client: Login successful. Redirecting to admin.')
    await navigateTo('/dashboard')
  } catch (err) {
    error.value = err.data?.statusMessage || err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-12">
    <UAuthForm
      :title="$t('admin.login.title')"
      icon="i-lucide-lock"
      :fields="fields"
      :submit="{ label: $t('admin.login.submit'), block: true }"
      :loading="loading"
      class="max-w-md w-full"
      @submit="login"
    >
      <template #validation>
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :description="error"
          icon="i-lucide-circle-alert"
        />
      </template>
    </UAuthForm>
  </div>
</template>
