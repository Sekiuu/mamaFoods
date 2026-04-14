import { PaymentStatus, type Order } from '~/types/orders'

export const useOrderManagement = () => {
    const orders = ref<Order[]>([])
    const newOrdersCount = ref(0)
    const isLoading = ref(false)

    const fetchOrders = async () => {
        try {
            isLoading.value = true
            const response = await $fetch<Order[]>('/api/orders')
            orders.value = response
            newOrdersCount.value = response.filter(order => order.status === 'pending').length
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            isLoading.value = false
        }
    }

    const updateOrderStatus = async (id: number, status: string) => {
        try {
            const payload = status === PaymentStatus.Paid ? { payment_status: status } : {  status: status }
            await $fetch(`/api/orders/${id}`, {
                method: 'PUT',
                body: payload
            })
            await fetchOrders()
        } catch (error) {
            console.error('Failed to update order:', error)
        }
    }

    const updateOrderDetails = async (id: number, data: Partial<Order>) => {
        try {
            await $fetch(`/api/orders/${id}`, {
                method: 'PUT',
                body: data
            })
            await fetchOrders()
        } catch (error) {
            console.error('Failed to update order:', error)
        }
    }

    const deleteOrder = async (id: number) => {
        if (!confirm('Are you sure you want to delete this order?')) return false

        try {
            await $fetch(`/api/orders/${id}`, {
                method: 'DELETE'
            })
            await fetchOrders()
            return true
        } catch (error) {
            console.error('Failed to delete order:', error)
            return false
        }
    }

    const formatDate = (date: string | Date | null) => {
        if (!date) return ''
        return new Date(date).toLocaleString()
    }

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            preparing: 'bg-blue-100 text-blue-800',
            delivering: 'bg-purple-100 text-purple-800',
            completed: 'bg-gray-100 text-gray-800'
        }
        return colors[status as keyof typeof colors] || colors.pending
    }

    const getNextStatus = (currentStatus: string) => {
        const workflow = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['preparing', 'cancelled'],
            preparing: ['delivering'],
            delivering: ['completed'],
            completed: [],
            cancelled: []
        }
        return workflow[currentStatus as keyof typeof workflow] || []
    }

    return {
        orders: readonly(orders),
        newOrdersCount: readonly(newOrdersCount),
        isLoading: readonly(isLoading),
        fetchOrders,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        formatDate,
        getStatusColor,
        getNextStatus
    }
}