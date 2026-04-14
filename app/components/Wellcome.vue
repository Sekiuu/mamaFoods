<template>
  <UPageCTA :title="$t('welcome.title') + ' MamaFood'" :subtitle="$t('welcome.subtitle')" 
  :links="[
    {
      label: $t('welcome.cta.button'),
      color: 'primary',
      variant: 'soft',
      onClick: orderNow,
      trailingIcon: 'i-lucide-arrow-right',
      activeVariant: 'subtle',
      activeColor: 'secondary',
      class:'hover:cursor-pointer hover:scale-125 transition-all duration-300'
    }
  ]" 
  class="mx-auto"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

// เรียกใช้งาน router instance
const router = useRouter()

const orderNow = () => {
  // ใช้ .push() บน router เพื่อย้ายไปยังหน้า /order
  router.push('/shop')
}
</script>