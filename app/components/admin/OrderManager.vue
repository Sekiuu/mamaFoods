<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
            <li v-for="order in orders" :key="order.id" class="px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center">
                            <p class="text-sm font-medium text-gray-900">Order #{{ order.id }}</p>
                            <span :class="[
                                getStatusColor(order.status),
                                'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                            ]">
                                {{ order.status }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">{{ order.customer_name }} - {{ order.customer_phone }}</p>
                        <p class="text-sm text-gray-500">{{ order.customer_address }}</p>
                        <p class="text-sm text-gray-500">Total: ${{ order.total_price }}</p>
                        <p class="text-sm text-gray-500">Created: {{ formatDate(order.create_at) }}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button v-if="order.status === 'pending'" @click="handleStatusUpdate(order.id, 'confirmed')"
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                            Confirm
                        </button>
                        <button v-if="order.status === 'pending' || order.status === 'confirmed'"
                            @click="handleStatusUpdate(order.id, 'cancelled')"
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                            Cancel
                        </button>
                        <button v-if="order.status === 'confirmed'" @click="handleStatusUpdate(order.id, 'preparing')"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                            Start Preparing
                        </button>
                        <button v-if="order.status === 'preparing'" @click="handleStatusUpdate(order.id, 'delivering')"
                            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                            Start Delivery
                        </button>
                        <button v-if="order.status === 'delivering'" @click="handleStatusUpdate(order.id, 'completed')"
                            class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                            Complete
                        </button>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types/orders'
import { useOrderManagement } from '~/composables/useOrderManagement'

interface Props {
    orders: Order[]
    onStatusUpdate: (id: number, status: string) => void
}

const props = defineProps<Props>()

const { formatDate, getStatusColor } = useOrderManagement()

const handleStatusUpdate = (id: number, status: string) => {
    props.onStatusUpdate(id, status)
}
</script>