// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config"
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils', "@nuxt/ui", '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'th', file: 'th.json', name: 'Thai' }
    ],
    defaultLocale: 'th',
    langDir: 'locales/'
  },
  runtimeConfig: {
    auth: {
      secret: process.env.NUXT_AUTH_SECRET || 'your-secret-key-change-this-in-production'
    }
  },
})