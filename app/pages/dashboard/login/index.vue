<script setup>
const loading = ref(false)
const error = ref('')

const { signin: signIn } = useUserAuth()

const fields = [
  {
    name: 'name',
    type: 'text',
    label: 'Username',
    placeholder: 'Username',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Password',
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
      title="Login"
      icon="i-lucide-lock"
      :fields="fields"
      :submit="{ label: 'Sign in', block: true }"
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
