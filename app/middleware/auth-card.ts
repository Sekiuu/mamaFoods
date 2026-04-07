export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.client) {
        const cart = localStorage.getItem('mamaFoodCart')
        if (!cart || JSON.parse(cart).length === 0) {
            return navigateTo('/order')
        }
    }
})