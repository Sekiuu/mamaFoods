<template>
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-extrabold text-gray-900 mb-2">Checkout</h1>
                <p class="text-gray-600">Review your order and complete your purchase</p>
            </div>

            <!-- Order Summary -->
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                <!-- Order Items -->
                <div class="space-y-4 mb-8">
                    <div v-for="item in cart" :key="item.id"
                        class="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                                <img :src="item.icon" :alt="item.icon" class="w-full h-full object-cover rounded-xl">
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-800">{{ item.name }}</h3>
                                <p class="text-sm text-gray-500">{{ item.description }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-800">฿{{ item.price * item.quantity }}</p>
                            <p class="text-sm text-gray-500">฿{{ item.price }} x {{ item.quantity }}</p>
                        </div>
                    </div>
                </div>

                <!-- Order Total -->
                <div class="border-t border-gray-200 pt-6">
                    <div class="flex justify-between items-center text-xl font-bold">
                        <span>Total Amount</span>
                        <span class="text-orange-600 font-mono">฿{{ totalPrice }}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500 mt-1">
                        <span>Total Items</span>
                        <span>{{ totalItems }}</span>
                    </div>
                </div>
            </div>

            <!-- Customer Information Form (Optional) -->
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Customer Information</h2>

                <form @submit.prevent="confirmOrder" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span class="text-red-500">*</span>
                            </label>
                            <input v-model="customerInfo.name" type="text" required placeholder="Enter your full name"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span class="text-red-500">*</span>
                            </label>
                            <input v-model="customerInfo.phone" type="tel" required
                                placeholder="Enter your phone number"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Address <span class="text-red-500">*</span>
                        </label>
                        <textarea v-model="customerInfo.address" required rows="3"
                            placeholder="Enter your delivery address"
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Special Instructions (Optional)
                        </label>
                        <textarea v-model="customerInfo.instructions" rows="2"
                            placeholder="Any special requests or instructions..."
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"></textarea>
                    </div>
                </form>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
                <button @click="cancelOrder"
                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all">
                    Cancel Order
                </button>

                <button @click="confirmOrder" :disabled="isProcessing || !isFormValid"
                    class="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg disabled:cursor-not-allowed">
                    {{ isProcessing ? 'Processing...' : 'Confirm Order' }}
                </button>
            </div>

            <!-- Success/Error Messages -->
            <div v-if="message.text"
                :class="message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'"
                class="mt-6 p-4 border rounded-xl">
                {{ message.text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CartItem, CustomerInfo } from '~/types'
import { OrderStatus } from '~/types/orders';

definePageMeta({
    middleware: 'auth-card'
});

const CART_KEY = 'mamaFoodCart'
const CUSTOMER_INFO_KEY = 'mamaFoodCustomerInfo'
const ORDER_IDS_COOKIE = 'mamaFoodOrderIds'

const router = useRouter()
const orderIdsCookie = useCookie<number[]>(ORDER_IDS_COOKIE, {
    default: () => [],
    maxAge: 60 * 60 * 24 * 30,
})

const cart = ref<CartItem[]>([])
const isProcessing = ref(false)
const message = ref({ text: '', type: '' })

const customerInfo = ref<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    instructions: '',
})

onMounted(() => {
    const savedCart = localStorage.getItem(CART_KEY)
    if (savedCart) {
        try {
            cart.value = JSON.parse(savedCart)
        } catch (error) {
            console.error('Error loading cart:', error)
        }
    }

    const savedCustomerInfo = localStorage.getItem(CUSTOMER_INFO_KEY)
    if (savedCustomerInfo) {
        try {
            customerInfo.value = JSON.parse(savedCustomerInfo)
        } catch (error) {
            console.error('Error loading customer info:', error)
        }
    }

    if (cart.value.length === 0) {
        router.push('/order')
    }
})

const totalItems = computed((): number => {
    return cart.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
})
const totalPrice = computed((): number => {
    return cart.value.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
})

const isFormValid = computed(() => {
    return (
        customerInfo.value.name.trim() &&
        customerInfo.value.phone.trim() &&
        customerInfo.value.address.trim()
    )
})

const cancelOrder = () => {
    localStorage.removeItem(CART_KEY)
    router.push('/shop')
}

const confirmOrder = async () => {
    if (!isFormValid.value) return

    isProcessing.value = true
    message.value = { text: '', type: '' }

    try {
        const payload = {
            customer_name: customerInfo.value.name,
            customer_phone: customerInfo.value.phone,
            customer_address: customerInfo.value.address,
            customer_note: customerInfo.value.instructions,
            items: cart.value,
            total_price: totalPrice.value,
            status: OrderStatus.Pending,
        }

        const order = await $fetch<any>('/api/orders', {
            method: 'POST',
            body: payload,
        }) as any

        const existingIds = Array.isArray(orderIdsCookie.value)
            ? orderIdsCookie.value
            : orderIdsCookie.value
                ? JSON.parse(orderIdsCookie.value as unknown as string)
                : []

        orderIdsCookie.value = Array.from(new Set([...existingIds, order.id]))

        localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(customerInfo.value))
        localStorage.removeItem(CART_KEY)

        router.push(`/myOrders/${order.id}`)
    } catch (error) {
        message.value = {
            text: 'Failed to place order. Please try again.',
            type: 'error',
        }
    } finally {
        isProcessing.value = false
    }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
