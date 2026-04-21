// Colors for order status tags
import { OrderStatus } from '#shared/types/orders'

export const useStatusConfig = () => {
    const statusConfig: Record<string, { color: "warning" | "info" | "success" | "error" | "neutral" | "secondary" | "primary", icon: string }> = {
    [OrderStatus.Pending]: { color: 'warning', icon: 'i-lucide-clock' },
    [OrderStatus.Confirmed]: { color: 'info', icon: 'i-lucide-check' },
    [OrderStatus.Preparing]: { color: 'info', icon: 'i-lucide-chef-hat' },
    [OrderStatus.Delivering]: { color: 'info', icon: 'i-lucide-bike' },
    [OrderStatus.Completed]: { color: 'success', icon: 'i-lucide-check-circle' },
    [OrderStatus.Cancelled]: { color: 'error', icon: 'i-lucide-x-circle' },
}
    return statusConfig;
}