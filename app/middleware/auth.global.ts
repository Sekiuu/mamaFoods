export default defineNuxtRouteMiddleware((to) => {
    const { user } = useUserSession()
    
    // Handle Admin Protection
    if (to.path.startsWith('/admin') && !user.value && to.path !== '/admin/login') {
        console.log('MIDLLEWARE: Admin not logged in. Redirecting to login...')
        return navigateTo('/admin/login')
    }
})