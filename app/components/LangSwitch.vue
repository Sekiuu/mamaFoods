<template>
    <ULocaleSelect 
    v-model="locale" 
    :locales="supportedLocales" 
    @update:model-value="(e : any) => onLocaleChange(e)" class="w-48" />
</template>
<script setup lang="ts">
import { th, en } from '@nuxt/ui/locale';

const { setLocale, locale } = useI18n()

const supportedLocales = [th, en]

const onLocaleChange = (selected: any) => {
    // ต้องส่งค่า .code (ที่เป็น string เช่น 'th' หรือ 'en') เข้าไปใน setLocale
    setLocale(selected.code)
}
</script>