export default defineNuxtRouteMiddleware((to) => {
    const { user: loggedIn } = useUserSession()
    
    // Handle Admin Protection
    if (to.path.startsWith('/admin') && !loggedIn.value && to.path !== '/admin/login') {
        console.log('MIDLLEWARE: Admin not logged in. Redirecting to login...')
        return navigateTo('/admin/login')
    }
})