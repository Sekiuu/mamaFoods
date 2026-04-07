<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Order CRUD Operations</h3>

            <!-- Orders Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="order in orders" :key="order.id">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ order.id }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customer_name }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customer_phone }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customer_address }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ order.total_price }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <select :value="order.status" @change="handleStatusChange(order.id, $event)"
                                    class="text-sm border-gray-300 rounded-md">
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="delivering">Delivering</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.create_at)
                                }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button @click="handleEdit(order)" class="text-indigo-600 hover:text-indigo-900 mr-2">
                                    Edit
                                </button>
                                <button @click="handleDelete(order.id)" class="text-red-600 hover:text-red-900">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Edit Modal -->
            <div v-if="editingOrder" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
                @click="closeEditModal">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                    <div class="mt-3">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Order #{{ editingOrder.id }}</h3>
                        <form @submit.prevent="handleSaveEdit">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Customer Name</label>
                                <input v-model="editingOrder.customer_name" type="text"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Phone</label>
                                <input v-model="editingOrder.customer_phone" type="text"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Address</label>
                                <textarea v-model="editingOrder.customer_address"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">Note</label>
                                <textarea v-model="editingOrder.customer_note"
                                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div class="flex justify-end space-x-2">
                                <button type="button" @click="closeEditModal"
                                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit"
                                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types/orders'
import { useOrderManagement } from '~/composables/useOrderManagement'
interface Props {
    orders: Order[]
    onStatusUpdate: (id: number, status: string) => void
    onEdit: (order: Order) => void
    onDelete: (id: number) => Promise<boolean>
}

const props = defineProps<Props>()

const editingOrder = ref<Order | null>(null)

const { formatDate } = useOrderManagement()

const handleStatusChange = (id: number, event: Event) => {
    const target = event.target as HTMLSelectElement
    props.onStatusUpdate(id, target.value)
}

const handleEdit = (order: Order) => {
    editingOrder.value = { ...order }
    props.onEdit(order)
}

const handleDelete = async (id: number) => {
    const success = await props.onDelete(id)
    if (success) {
        // Handle success
    }
}

const handleSaveEdit = async () => {
    if (!editingOrder.value) return

    try {
        await props.onStatusUpdate(editingOrder.value.id, editingOrder.value.status || 'pending')
        // Additional update logic can be added here
        editingOrder.value = null
    } catch (error) {
        console.error('Failed to save order:', error)
    }
}

const closeEditModal = () => {
    editingOrder.value = null
}

defineExpose({
    editingOrder
})
</script>