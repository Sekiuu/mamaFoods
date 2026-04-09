import type { UserItem } from "~/types"

export const useAdminAuth = () => {
    const { fetch: refreshSession } = useUserSession()
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

    return {
        logout,
        signin
    }
}