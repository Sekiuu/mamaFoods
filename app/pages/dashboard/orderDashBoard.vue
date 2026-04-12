<script setup lang="ts">
import { useOrderManagement } from '~/composables/useOrderManagement'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import OrderManager from '~/components/admin/OrderManager.vue'
import OrderCrud from '~/components/admin/OrderCrud.vue'
import type { Order } from '~/types'
import type { TabsItem } from '@nuxt/ui'
const activeTab = ref('manager')
enum TabsRepresents {
    manager = 'manager',
    crud = 'crud'
}
const tabs: TabsItem[] = [
    {
        label: 'managers',
        value: 'manager',
        icon: 'i-lucide-list'
    },
    {
        label: 'CRUD Operations',
        value: 'crud',
        icon: 'i-lucide-list'
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
    <AdminHeader title="Order Management" :enable-logout="true" />
    <UPage class="min-h-screen max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <!-- Notifications -->
            <UAlert v-if="newOrdersCount > 0" variant="soft"
                :title="`You have ${ newOrdersCount } new pending order${ newOrdersCount > 1 ? 's' : '' }!`" />

            <!-- Tabs -->
            <UTabs class="mb-6" v-model="activeTab" :items="tabs" color="neutral" variant="pill" />

            <!-- Order Manager Tab -->
            <OrderManager v-if="activeTab === TabsRepresents.manager" :orders="orders as Order[]"
                :on-status-update="handleStatusUpdate" />


            <!-- CRUD Operations Tab -->
            <OrderCrud v-if="activeTab === TabsRepresents.crud" :orders="orders as Order[]"
                :on-status-update="handleStatusUpdate" :on-edit="handleEdit" :on-delete="handleDelete" />
        </div>
    </UPage>
</template>