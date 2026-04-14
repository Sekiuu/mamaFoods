import type { CartItem } from './foods'

export interface CustomerInfo {
    name: string
    phone: string
    address: string
    instructions: string
}

export interface Order {
    id: number
    customer_name: string | ''
    customer_phone: string | ''
    customer_address: string | ''
    customer_note: string | ''
    items: string
    total_price: string
    payment_status: PaymentStatus
    status: OrderStatus
    create_at: Date | string
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
