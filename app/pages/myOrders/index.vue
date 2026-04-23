<script setup lang="ts">
import type { Order } from '#shared/types'
import { OrderStatus, PaymentStatus } from '#shared/types/orders'
import type { TabsItem } from '@nuxt/ui'

const ORDER_IDS_COOKIE = process.env.ORDER_IDS_COOKIE || 'mamaFoodOrderIds'

const { t } = useI18n()

const orderIdsCookie = useCookie<number[]>(ORDER_IDS_COOKIE, {
    default: () => [],
})

const orders = ref<Order[]>([])
const filterStatus = ref<Array<OrderStatus | PaymentStatus>>([])
const loading = ref(true)
const activeTab = ref('pending')

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
        orders.value = await $fetch<Array<Order>>(path)
    } catch (error) {
        console.error('Failed to load orders:', error)
    } finally {
        loading.value = false
    }
}

// Tab definitions — value maps to a filter preset
const tabs = computed<TabsItem[]>(() => [
    { label: t('myOrders.tabs.all'), value: 'all', icon: 'i-lucide-list' },
    { label: t('myOrders.tabs.pending'), value: 'pending', icon: 'i-lucide-clock' },
    { label: t('myOrders.tabs.cancelled'), value: 'cancelled', icon: 'i-lucide-x-circle' },
    { label: t('myOrders.tabs.completed'), value: 'completed', icon: 'i-lucide-check-circle' },
    { label: t('myOrders.tabs.unpaid'), value: 'unpaid', icon: 'i-lucide-credit-card' },
])

const filterPresets: Record<string, Array<OrderStatus | PaymentStatus>> = {
    all: [OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Preparing,
    OrderStatus.Delivering, OrderStatus.Delivered, OrderStatus.Completed,
    OrderStatus.Cancelled],
    pending: [
        OrderStatus.Confirmed, OrderStatus.Preparing, OrderStatus.Delivering,
        OrderStatus.Pending
    ],
    cancelled: [
        OrderStatus.Cancelled
    ],
    completed: [
        OrderStatus.Completed,
    ],
    unpaid: [PaymentStatus.Unpaid],
}

watch(activeTab, (tab) => {
    filterStatus.value = filterPresets[tab] ?? []
})

onMounted(() => {
    loadOrders()
    activeTab.value = OrderStatus.Pending;
    filterStatus.value = filterPresets.pending ?? []
})
</script>

<template>
    <UPage class="min-h-screen md:max-w-6xl max-w-xs mx-auto">
        <UPageHeader
            :title="$t('myOrders.title')"
            :description="$t('myOrders.subtitle')"
            icon="i-lucide-shopping-bag"
            :ui="{ title: 'text-2xl font-bold text-center w-full', description: 'text-muted text-center' }"
        />

        <UPageBody>
            <!-- Loading state -->
            <div v-if="loading" class="flex flex-col gap-3 py-20">
                <USkeleton class="h-12 w-full" v-for="i in 4" :key="i" />
            </div>

            <template v-else>
                <!-- Mobile: Select dropdown -->
                <USelect
                    v-model="activeTab"
                    :items="tabs"
                    value-key="value"
                    label-key="label"
                    class="mb-4 sm:hidden w-full"
                />

                <!-- Desktop: Full tabs -->
                <UTabs
                    v-model="activeTab"
                    :items="tabs"
                    :content="false"
                    color="neutral"
                    variant="pill"
                    class="mb-6 hidden sm:flex"
                />

                <!-- Orders list -->
                <OrderList
                    :orders="orders"
                    :format-date="formatDate"
                    :filter-status="filterStatus"
                />
            </template>
        </UPageBody>
    </UPage>
</template>