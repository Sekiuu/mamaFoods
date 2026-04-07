export const useAdminAuth = () => {
    const logout = async () => {
        await $fetch('/api/auth/logout', {
            method: 'POST'
        })
        await navigateTo('/admin/login')
    }
    const session = async () => (await $fetch('/api/auth/session'))

    return {
        session,
        logout,
        isAuthenticated: computed(() => !!session().then(res => res?.user))
    }
}