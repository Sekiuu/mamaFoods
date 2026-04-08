<template>
  <div class="flex gap-2">
    <button 
      v-for="locale in locales" 
      :key="typeof locale === 'string' ? locale : locale.code"
      @click="setLocale(typeof locale === 'string' ? locale : locale.code)"
      class="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
      :class="currentLocale === (typeof locale === 'string' ? locale : locale.code) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
    >
      {{ (typeof locale === 'string' ? locale : locale.name || locale.code).toUpperCase() }}
    </button>
  </div>
</template>

<script lang="ts" setup>
const { locales, locale: currentLocale, setLocale } = useI18n()
</script>
