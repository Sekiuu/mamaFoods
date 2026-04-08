export default defineNuxtRouteMiddleware((to) => {
    if (to.path.includes('/checkout') && import.meta.client) {
        console.log('checkout')
        const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
        const cart = useCookie(CART_KEY).value
        console.log('cart', cart)

        if (!cart || cart.length === 0) {
            console.log('no cart. back to shop')
            return navigateTo('/shop')
        }
    }
})