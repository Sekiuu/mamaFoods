export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.client) {
        const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
        const cart = localStorage.getItem(CART_KEY)
        if (!cart || JSON.parse(cart).length === 0) {
            return navigateTo('/shop')
        }
    }
})