export default defineNuxtRouteMiddleware((to) => {
    const { isAdmin, isOperator } = useUserAuth()
    const canAcessDashboard = isAdmin.value || isOperator.value
    // Handle Admin Protection
    if (to.path.startsWith('/dashboard') && !canAcessDashboard && to.path !== '/dashboard/login') {
        console.log('MIDLLEWARE: You not logged in. Redirecting to login...')
        return navigateTo('/dashboard/login')
    }
    if (to.path.startsWith('/dashboard/login') && canAcessDashboard) {
        console.log('MIDLLEWARE: Admin already logged in. Redirecting to dashboard...')
        return navigateTo('/dashboard')
    }
    if(to.path.startsWith('/dashboard/userDashBoard') && !isAdmin.value){
        console.log('MIDLLEWARE: You have no permission to access this page. Redirecting to dashboard...')
        return navigateTo('/dashboard')
    }
})