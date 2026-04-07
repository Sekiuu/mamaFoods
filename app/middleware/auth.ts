export default defineNuxtRouteMiddleware(async () => {
    const { loggedIn } = useUserSession() // Hook จาก auth-utils

    if (!loggedIn.value) {
        return navigateTo('/admin/login')
    }
})