export interface CartItem {
  food_id: number
  food_name?: string | null
  food_discription?: string | null
  food_price: number 
  food_icon: string
  options?: FoodOptionChoice[] | null
  quantity: number
  total_price: number
}

export interface FoodItem {
  id: number
  name?: string | null
  price?: string | null
  description?: string | null
  icon?: string | null
  show?: boolean
  options?: string | FoodOption[] | null
  last_edit?: Date | null
}
export interface FoodOptionChoice {
  name: string
  price: number
  default: boolean
}
export interface FoodOption {
  name: string
  description: string
  type : 'single' | 'multiple'
  required: boolean
  choices: FoodOptionChoice[] | string
}