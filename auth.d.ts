import type { Role } from "~/types"

declare module '#auth-utils' {
    interface User {
        id: number
        name: string
        role: Role.ADMIN | Role.OPERATOR | Role.CUSTOMER
    }

}

export { }