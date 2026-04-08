export const useAdminAuth = () => {
    const logout = async () => {
        await $fetch('/api/auth/logout', {
            method: 'POST'
        })
        await navigateTo('/admin/login')
    }
    const session = useUserSession()

    return {
        session,
        logout,
    }
}