<template>
    <UApp :locale="locales[locale]">
        <Nav title="Mama Food" :showDashBoard="isAdmin || isOperator" />
        <NuxtPage />
    </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
const { isAdmin, isOperator } = useUserAuth();

const { locale } = useI18n()
</script>
