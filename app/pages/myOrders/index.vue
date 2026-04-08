<template>
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
            <div class="mb-10 text-center">
                <h1 class="text-4xl font-extrabold text-gray-900">
                    {{ $t('myOrders.title') }}
                </h1>
                <p class="text-gray-600 mt-2">
                    {{ $t('myOrders.subtitle') }}
                </p>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
                <div class="mb-2">
                    <UButton class="mr-2 bg-yellow-500 hover:bg-yellow-600 text-white" @click="() => setFilterStatus([])">
                        {{ $t('myOrders.tabs.all') }}
                    </UButton>
                    <UButton class="mr-2 bg-blue-500 hover:bg-blue-600 text-white" @click="showOpenOrders">
                        {{ $t('myOrders.tabs.pending') }}
                    </UButton>
                    <UButton class="mr-2 bg-red-500 hover:bg-red-600 text-white" @click="showCancelledOrders">
                        {{ $t('myOrders.tabs.cancelled') }}
                    </UButton>
                    <UButton class="mr-2 bg-green-500 hover:bg-green-600 text-white" @click="showCompletedOrders">
                        {{ $t('myOrders.tabs.completed') }}
                    </UButton>
                </div>
                <OrderList :orders="orders" :formatDate="formatDate" :filterStatus="filterStatus" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types'
import { OrderStatus } from '~/types/orders'

const ORDER_IDS_COOKIE = process.env.ORDER_IDS_COOKIE || 'mamaFoodOrderIds'

const orderIdsCookie = useCookie<number[]>(ORDER_IDS_COOKIE, {
    default: () => [],
})
const orders = ref<Order[]>([])
const filterStatus = ref<OrderStatus[]>([]) // e.g. ['cancelled', 'completed']
const loading = ref(true)

const formatDate = (value: string | Date | null) => {
    if (!value) return 'Unknown'
    const date = new Date(value)
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const loadOrders = async () => {
    loading.value = true
    try {
        const ids = Array.isArray(orderIdsCookie.value)
            ? orderIdsCookie.value
            : orderIdsCookie.value
                ? JSON.parse(orderIdsCookie.value as unknown as string)
                : []

        if (ids.length === 0) {
            orders.value = []
            return
        }

        const path = '/api/orders?ids=' + ids.join(',')
        orders.value = await $fetch<Array<{
            id: number
            customer_name: string | null
            customer_phone: string | null
            customer_address: string | null
            customer_note: string | null
            items: string | null
            total_price: string | null
            status: OrderStatus | "pending"
            create_at: string | Date | null
        }>>(path)
    } catch (error) {
        console.error('Failed to load orders:', error)
    } finally {
        loading.value = false
    }
}
const setFilterStatus = (status: OrderStatus[]) => {
    filterStatus.value = status
}
const showCancelledOrders = () => setFilterStatus([
    OrderStatus.Pending,
    OrderStatus.Preparing,
    OrderStatus.Delivering,
    OrderStatus.Confirmed,
    OrderStatus.Completed,
])
const showCompletedOrders = () => setFilterStatus([
    OrderStatus.Pending,
    OrderStatus.Preparing,
    OrderStatus.Delivering,
    OrderStatus.Confirmed,
    OrderStatus.Cancelled,
])
const showOpenOrders = () => setFilterStatus([
    OrderStatus.Cancelled,
    OrderStatus.Completed,
])


onMounted(() => {
    loadOrders()
    showOpenOrders()
})
</script>