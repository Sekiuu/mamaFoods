<script setup lang="ts">
import { useOrderManagement } from '~/composables/useOrderManagement'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import OrderManager from '~/components/admin/OrderManager.vue'
import OrderCrud from '~/components/admin/OrderCrud.vue'
import { type Order } from '#shared/types'
import { Role } from '#shared/types/users'
import type { TabsItem } from '@nuxt/ui'
import { OrderStatus, PaymentStatus } from '#shared/types/orders'
import type { SelectMenuItem } from '@nuxt/ui'
const { t } = useI18n()

const activeTab = ref('manager')
enum TabsRepresents {
    manager = 'manager',
    crud = 'crud'
}
const globalFilter = ref('')
const filterStatus = ref<Array<OrderStatus | PaymentStatus>>([])
const activeOrders = computed(() => {
    if (!orders.value) return []
    if (filterStatus.value.length === 0) return orders.value
    return orders.value.filter(o =>
        (filterStatus.value.includes(o.status) || filterStatus.value.includes(o.payment_status)) &&
        o.customer_name.toLowerCase().includes(globalFilter.value.toLowerCase()))
}
)

const filterOptions: Array<SelectMenuItem> = [
    { label: t('order.status.title'), type: 'label' },
    { label: t('order.status.pending'), value: OrderStatus.Pending, icon: 'i-lucide-clock' },
    { label: t('order.status.confirmed'), value: OrderStatus.Confirmed, icon: 'i-lucide-check' },
    { label: t('order.status.preparing'), value: OrderStatus.Preparing, icon: 'i-lucide-chef-hat' },
    { label: t('order.status.delivering'), value: OrderStatus.Delivering, icon: 'i-lucide-bike' },
    { label: t('order.status.delivered'), value: OrderStatus.Delivered, icon: 'i-lucide-package-check' },
    { label: t('order.status.completed'), value: OrderStatus.Completed, icon: 'i-lucide-check-circle' },
    { label: t('order.status.cancelled'), value: OrderStatus.Cancelled, icon: 'i-lucide-x-circle' },
    { type: 'separator' },
    { label: t('payment.status'), type: 'label' },
    { label: t('payment.paid'), value: PaymentStatus.Paid, icon: 'i-lucide-circle-dollar-sign' },
    { label: t('payment.unpaid'), value: PaymentStatus.Unpaid, icon: 'i-lucide-ban' },
]

const { isAdmin } = useUserAuth()
const tabs: TabsItem[] = [
    {
        label: t('tabs.manager'),
        value: 'manager',
        icon: 'i-lucide-list'

    },
    {
        label: t('tabs.crud'),
        value: 'crud',
        icon: 'i-lucide-list',
        disabled: !isAdmin.value
    }
]
const {
    orders,
    newOrdersCount,
    fetchOrders,
    updateOrderStatus,
    updateOrderDetails,
    deleteOrder
} = useOrderManagement()

const handleStatusUpdate = async (id: number, status: string) => {
    await updateOrderStatus(id, status)
}

const handleEdit = async (order: any) => {
    // Handle edit logic if needed
    console.log('Editing order:', order)
}

const handleDelete = async (id: number) => {
    return await deleteOrder(id)
}

// Poll for new orders every 3 seconds
const pollIntervalTime = 3000
// Check auth and fetch data
onMounted(async () => {
    await fetchOrders()
    setInterval(fetchOrders, pollIntervalTime)
})
</script>

<template>
    <AdminHeader :title="$t('admin.header.order')" :enable-back="true" />
    <UCard class="min-h-screen max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        <!-- Notifications -->
        <template #header>
            <UAlert v-if="newOrdersCount > 0" variant="soft"
                :title="$t('admin.crud.newOrders', { count: newOrdersCount })" />

            <!-- Tabs -->
            <UTabs class="mb-6" v-model="activeTab" :items="tabs" color="neutral" variant="pill" />
            <!-- Search and filter -->
            <div class="space-x-6">
                <UInput v-model="globalFilter" color="info" variant="soft" icon="i-lucide-search"
                    :placeholder="$t('admin.crud.search')" class="w-64 my-auto" />
                <!-- Filter combobox dropdown with checkboxes -->
                <USelectMenu v-model="filterStatus" :items="filterOptions" value-key="value" multiple
                    :placeholder="$t('order.status.title')" leading-icon="i-lucide-filter" :clear="filterStatus.length > 0"
                    class="w-full sm:w-56">
                    <!-- Trigger label: show count badge when filters active -->
                    <template #default>
                        <span v-if="filterStatus.length === 0" class="text-muted">{{ $t('admin.crud.search') }}</span>
                        <span v-else class="flex items-center gap-1.5">
                            {{ $t('admin.table.status') }}
                            <UBadge :label="String(filterStatus.length)" color="primary" variant="solid" />
                        </span>
                    </template>
                </USelectMenu>
            </div>
        </template>
        <!-- Order Manager Tab -->
        <OrderManager v-if="activeTab === TabsRepresents.manager" detail-link="orders/" :orders="activeOrders as Order[]"
            :on-status-update="handleStatusUpdate" />


        <!-- CRUD Operations Tab -->
        <OrderCrud v-if="activeTab === TabsRepresents.crud" :orders="activeOrders as Order[]"
            :on-status-update="handleStatusUpdate" :on-edit="handleEdit" :on-delete="handleDelete" />

    </UCard>
</template>