import { Role } from '~/types/users'

export const useUserAuth = () => {
    const { fetch: refreshSession, session } = useUserSession()

    const isAdmin = computed<boolean>(() => session.value?.user?.role === Role.ADMIN)
    const isOperator = computed<boolean>(() => session.value?.user?.role === Role.OPERATOR)
    const isCustomer = computed<boolean>(() => session.value?.user?.role === Role.CUSTOMER)
    const isLoggedIn = computed<boolean>(() => !!session.value?.user)
    const currentUser = computed(() => session.value?.user ?? null)

    const logout = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' })
        await refreshSession()
    }

    const signin = async (name: string, password: string) => {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { name, password },
        })
        await refreshSession()
    }

    return {
        session,
        currentUser,
        isLoggedIn,
        isAdmin,
        isOperator,
        isCustomer,
        logout,
        signin,
    }
}
