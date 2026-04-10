<template>
    <ULocaleSelect v-model="locale" :locales="Object.values([th, en])" @update:model-value="(e : any) => setLocale(e)" class="w-48" />
</template>
<script setup lang="ts">
import { th, en } from '@nuxt/ui/locale';

const { setLocale, locale } = useI18n()
</script>