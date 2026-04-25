// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config"
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils', "@nuxt/ui", '@nuxtjs/i18n', '@nuxtjs/cloudinary'],
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  },
  css: ['~/assets/css/main.css'],
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'th', file: 'th.json', name: 'Thai' }
    ],
    defaultLocale: 'th',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: true
    }
  },
  runtimeConfig: {
    auth: {
      secret: process.env.NUXT_AUTH_SECRET || 'your-secret-key-change-this-in-production'
    },

    googleServiceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '',

    public: {
      promptpayPhone: process.env.PROMPTPAY_PHONE,
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME, // Kept for manual access if needed
      }
    },
    cloudinary: {
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: {
        foods: process.env.CLOUDINARY_FOLDER_FOODS
      }
    },
  },
  colorMode: {
    preference: 'light',
    fallback: 'light' // fallback if system preference can't be detected
  }
})