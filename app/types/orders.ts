import type { CartItem } from './foods'

export interface CustomerInfo {
    name: string
    phone: string
    address: string
    instructions: string
}

export interface Order {
    id: number
    customer_name: string | null
    customer_phone: string | null
    customer_address: string | null
    customer_note: string | null
    items: string | null
    total_price: string | null
    payment_status: PaymentStatus
    status: OrderStatus
    create_at: Date | string | null
}
export enum OrderStatus {
    Pending = "pending",
    Confirmed = "confirmed",
    Cancelled = "cancelled",
    Preparing = "preparing",
    Delivering = "delivering",
    Delivered = "delivered",
    Completed = "completed",
}
export enum PaymentStatus {
    Unpaid = "unpaid",
    Paid = "paid",
}
export interface OrderWithParsedItems extends Order {
    parsedItems: CartItem[]
}
