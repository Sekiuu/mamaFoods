// import type { UserItem } from "~/types"

export const useAuth = () => {
    const { fetch: refreshSession, session } = useUserSession()
    const logout = async () => {
        await $fetch('/api/auth/logout', {
            method: 'POST'
        })
        await refreshSession()
    }
    const signin = async (name: string, password: string) => {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { name, password }
        })
        await refreshSession()
    }
    const isAdmin = computed(() => session.value?.user?.role === 'admin')
    const isOperator = computed(() => session.value?.user?.role === 'operator')

    return {
        isAdmin,
        isOperator,
        logout,
        signin
    }
}