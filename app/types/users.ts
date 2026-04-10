export interface UserItem {
  id: number
  name: string | null
  role: Role.ADMIN | Role.OPERATOR | null
  create_at: Date | string | null
}

export enum Role {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  CUSTOMER = 'customer'
}
export const roles = [Role.ADMIN, Role.OPERATOR, Role.CUSTOMER]