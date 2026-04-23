import { Role } from '#shared/types/users'
export interface ReviewData {
    id: number
    rating: number
    comment: string
    order_id: number
    reviewer_role: Role
    create_at: Date | string
}