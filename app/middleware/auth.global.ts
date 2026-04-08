export default defineNuxtRouteMiddleware((to) => {
    const { user: loggedIn } = useUserSession()
    
    // Handle Admin Protection
    if (to.path.startsWith('/admin') && to.path !== '/admin/login' && !loggedIn.value) {
        console.log('MIDLLEWARE: Admin not logged in. Redirecting to login...')
        return navigateTo('/admin/login')
    }
})