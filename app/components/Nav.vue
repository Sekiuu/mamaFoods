<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  title: string
  showDashBoard: boolean
}>()

const { t } = useI18n()

const navItems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    { label: t('nav.menu'), to: '/shop', icon: 'material-symbols:shopping-cart-outline-sharp' },
    { label: t('nav.myOrders'), to: '/myOrders', icon: 'material-symbols:receipt-long-rounded' },
  ]
  if (props.showDashBoard) {
    items.push({ label: 'Dashboard', to: '/dashboard', icon: 'material-symbols:admin-panel-settings' })
  }
  return items
})
</script>

<template>
  <UHeader :to="'/'" :title="title" class="transition-300">

    <!-- Logo -->
    <template #title>
      <span class="text-xl font-bold text-warning tracking-tight">
        {{ title }}
      </span>
    </template>

    <!-- Center nav links (desktop) -->
    <UNavigationMenu color="info" :items="navItems" highlight />

    <!-- Right side actions -->
    <template #right>
      <div class="hidden md:flex items-center gap-2">
        <LangSwitch />
        <ThemeSwitch />
      </div>
    </template>

    <!-- Mobile menu body -->
    <template #body>
      <UNavigationMenu color="primary" :items="navItems" orientation="vertical" class="-mx-2.5" />
      <div class="flex items-center gap-2 mt-4 px-2">
        <LangSwitch />
        <ThemeSwitch />
      </div>
    </template>

  </UHeader>
</template>