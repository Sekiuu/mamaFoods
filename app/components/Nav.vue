<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-orange-600 tracking-tight hover:opacity-80 transition-opacity">
            {{title}}
          </NuxtLink>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/shop" class="text-sm hover:cursor-pointer font-medium text-gray-600 hover:text-orange-600 transition-colors">
            {{ $t("nav.menu") }}
          </NuxtLink>
          <NuxtLink to="/myOrders" class="text-sm hover:cursor-pointer font-medium text-gray-600 hover:text-orange-600 transition-colors">
            {{ $t("nav.myOrders") }}
          </NuxtLink>
          <NuxtLink v-if="enableAdmin" to="/admin" class="hover:cursor-pointer text-xs font-semibold text-gray-400 hover:text-gray-900 uppercase tracking-wider transition-colors ml-4">
            Admin
          </NuxtLink>
          <LangSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    enableAdmin: boolean;
}>()
</script>