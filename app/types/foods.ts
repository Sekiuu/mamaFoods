export interface CartItem {
  id: number
  name: string
  price: number
  description: string
  icon: string
  quantity: number
}

export interface MenuItem extends Omit<CartItem, 'quantity'> {}

export interface FoodItem {
  id: number
  name?: string | null
  price?: string | null
  description?: string | null
  icon?: string | null
  show?: boolean
  last_edit?: Date | null
}
