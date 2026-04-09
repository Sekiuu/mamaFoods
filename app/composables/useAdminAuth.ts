import type { UserItem } from "~/types"

export const useAdminAuth = () => {
    const logout = async () => {
        await $fetch('/api/auth/logout', {
            method: 'POST'
        })
    }
    const signin = async (name: string, password: string) => {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { name, password }
        })
    }
    const session = useUserSession()

    return {
        session,
        logout,
        signin
    }
}