<template>
    <div>
        <div v-if="activeOrders.length === 0" class="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
            <p class="text-gray-500">No orders yet.</p>
        </div>

        <div v-else class="space-y-4">
            <!-- Order Cards -->
            <div v-for="order in activeOrders" :key="order.id"
                class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Order ID</p>
                        <h2 class="text-xl font-semibold text-gray-900">#{{ order.id }}</h2>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Total</p>
                        <p class="text-lg font-bold text-orange-600">฿{{ order.total_price }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Status</p>
                        <OrderStatusTag :status="order.status" />
                    </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-3 items-center justify-between">
                    <p class="text-sm text-gray-500">Created: {{ formatDate(order.create_at) }}</p>
                    <NuxtLink :to="`/myOrders/${order.id}`"
                        class="inline-flex items-center rounded-2xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 transition">
                        View Details
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import type { Order } from '~/types'

const props = defineProps<{
    orders: Order[]
    formatDate: (value: string | Date | null) => string
    filterStatus: string[]
}>()

const activeOrders = computed(() => props.orders.filter(o => !props.filterStatus.includes(o.status)))

</script>