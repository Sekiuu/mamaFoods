<script setup lang="ts">
import type { Order } from '#shared/types'
import type { FoodOrderItem, OldFoodOrderItem } from '#shared/types/foods'
import { OrderStatus, PaymentStatus } from '#shared/types/orders'
const props = defineProps<{
    orders: Order[]
    formatDate: (value: string | Date | null) => string
    filterStatus: Array<OrderStatus | PaymentStatus>
}>()

const activeOrders = computed(() => props.orders.filter(o =>
    props.filterStatus.includes(o.status) ||
    props.filterStatus.includes(o.payment_status)))

/**
 * Safely parses the stringified items and normalizes fields
 */
const parseItems = (itemsStr: string) => {
    try {
        const parsed = JSON.parse(itemsStr)
        if (!Array.isArray(parsed)) return []
        // Normalize both old and new item formats to CartItem shape
        return parsed.map((i: FoodOrderItem | OldFoodOrderItem | any) => ({
            food_id: i.food_id ?? i.id,
            food_name: i.food_name ?? i.name,
            quantity: i.quantity ?? i.quantity
        }))
    } catch (e) {
        console.error('Failed to parse items:', e)
        return []
    }
}


</script>

<template>
    <!-- Empty state -->
    <UCard v-if="activeOrders.length === 0" class="text-center py-10">
        <p class="text-muted">{{ $t('orderList.empty') }}</p>
    </UCard>

    <!-- Order list -->
    <UCard v-else v-for="order in activeOrders" :key="order.id">
        <!-- Header: Order ID + Total + Status -->
        <template #header>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <!-- Order ID -->
                <div>
                    <p class="text-sm text-muted">{{ $t('orderCard.orderId') }}</p>
                    <p class="text-xl font-semibold">#{{ order.id }}</p>
                </div>

                <!-- Total -->
                <div class="sm:text-right">
                    <p class="text-sm text-muted">{{ $t('shop.cart.total') }}</p>
                    <p class="text-lg font-bold text-primary">฿{{ order.total_price }}</p>
                </div>

                <!-- Status Badge -->
                <div class="sm:text-right">
                    <p class="text-sm text-muted mb-1">{{ $t('order.status.title') }}</p>
                    <OrderStatusTag :status="order.status" />
                </div>
            </div>
            <!-- Order Items -->
            <div>
                <p class="text-sm text-muted mb-1">{{ $t('order.items') }}</p>
                <ul class="list-disc list-inside text-sm">
                    <li v-for="item in parseItems(order.items)" :key="item.food_id">
                        {{ item.food_name }} x {{ item.quantity }}
                    </li>
                </ul>
            </div>
        </template>
        <!-- Footer: Date + View Details -->
        <template #footer>
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 text-sm text-muted">
                    <UIcon name="i-lucide-calendar" class="size-4" />
                    <span>{{ formatDate(order.create_at) }}</span>
                </div>

                <UButton :to="`/myOrders/${order.id}`" color="primary" variant="solid"
                    trailing-icon="i-lucide-arrow-right">
                    {{ $t('orderList.viewDetails') }}
                </UButton>
            </div>
        </template>
    </UCard>
</template>
