
<script setup lang="ts">
import type { ToasterProps } from '@nuxt/ui';
import * as locales from '@nuxt/ui/locale'
const { isAdmin, isOperator } = useUserAuth();
const { locale } = useI18n()
const toaster = { position: 'top-left' } as ToasterProps
</script>
<template>
    <UApp :locale="locales[locale]" :toaster="toaster">
        <Nav title="Mama Food" :showDashBoard="isAdmin || isOperator" />
        <NuxtPage />
    </UApp>
</template>
