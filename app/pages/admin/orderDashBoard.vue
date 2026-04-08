<template>
    <PageHeader title="Order Dashboard" :enable-logout="false">
        <template #actions>
            <NuxtLink to="/admin" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-4">
                Back to Dashboard
            </NuxtLink>
        </template>
    </PageHeader>
    <div class="min-h-screen bg-gray-100">

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <!-- Notifications -->
                <NotificationAlert :show="newOrdersCount > 0">
                    You have {{ newOrdersCount }} new pending order{{ newOrdersCount > 1 ? 's' : '' }}!
                </NotificationAlert>

                <!-- Tabs -->
                <div class="mb-6">
                    <nav class="flex space-x-4" aria-label="Tabs">
                        <button @click="activeTab = 'manager'" :class="[
                            activeTab === 'manager'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700',
                            'px-3 py-2 font-medium text-sm rounded-md'
                        ]">
                            Order Manager
                        </button>
                        <button @click="activeTab = 'crud'" :class="[
                            activeTab === 'crud'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700',
                            'px-3 py-2 font-medium text-sm rounded-md'
                        ]">
                            CRUD Operations
                        </button>
                    </nav>
                </div>

                <!-- Order Manager Tab -->
                <OrderManager v-if="activeTab === 'manager'" :orders="orders as Order[]"
                    :on-status-update="handleStatusUpdate" />

                <!-- CRUD Operations Tab -->
                <OrderCrud v-if="activeTab === 'crud'" :orders="orders as Order[]"
                    :on-status-update="handleStatusUpdate" :on-edit="handleEdit" :on-delete="handleDelete" />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useOrderManagement } from '~/composables/useOrderManagement'
import PageHeader from '~/components/admin/PageHeader.vue'
import OrderManager from '~/components/admin/OrderManager.vue'
import OrderCrud from '~/components/admin/OrderCrud.vue'
import type { Order } from '~/types'
const activeTab = ref('manager')

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