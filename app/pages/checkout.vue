<template>
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <p class="text-gray-600">
                    {{ $t('checkout.subtitle') }}
                </p>
            </div>

            <!-- Order Summary -->
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    {{ $t('checkout.orderSummary.title') }}
                </h2>

                <!-- Order Items -->
                <div class="space-y-4 mb-8">
                    <div v-for="item in cartItems" :key="item.id"
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
                <div class="border-t border-gray-200 pt-6 text-gray-800">
                    <div class="flex justify-between items-center text-xl font-bold">
                        <span>
                            {{ $t('checkout.orderSummary.total') }}
                        </span>
                        <span class="text-orange-600 font-mono">
                            ฿{{ totalPrice }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500 mt-1">
                        <span>
                            {{ $t('checkout.orderSummary.totalItems') }}
                        </span>
                        <span>
                            {{ totalItems }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Customer Information Form (Optional) -->
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    {{ $t('customerInfo.title') }}
                </h2>
                <!-- Success/Error Messages -->
                <div v-if="message.text"
                    :class="message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'"
                    class="my-6 p-4 border rounded-xl">
                    {{ message.text }}
                </div>
                <!-- Customer Information Form-->
                <form @submit.prevent="confirmOrder" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                {{ $t('customerInfo.name') }}
                                <span class="text-red-500">*</span>
                            </label>
                            <input v-model="customerInfo.name" type="name" required placeholder="Enter your full name"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                {{ $t('customerInfo.phone') }}
                                <span class="text-red-500">*</span>
                            </label>
                            <input v-model="customerInfo.phone" type="tel" required
                                placeholder="Enter your phone number"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('customerInfo.address') }}
                            <span class="text-red-500">*</span>
                        </label>
                        <textarea v-model="customerInfo.address" required rows="3"
                            placeholder="Enter your delivery address"
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('customerInfo.note') }}
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

                <button @click="confirmOrder" :disabled="isProcessing"
                    class="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg disabled:cursor-not-allowed">
                    {{ isProcessing ? 'Processing...' : 'Confirm Order' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CartItem, CustomerInfo } from '~/types'
import { OrderStatus } from '~/types/orders';
import { useCustomerInfoValidate } from '~/composables/useCustomerInfoValidate'
import { useToast } from '#imports';
definePageMeta({
    middleware: ['auth-cart']
})

const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
const CUSTOMER_INFO_KEY = process.env.CUSTOMER_INFO_KEY || 'mamaFoodCustomerInfo'
const ORDER_IDS_COOKIE = process.env.ORDER_IDS_COOKIE || 'mamaFoodOrderIds'

const router = useRouter()
const orderIdsCookie = useCookie<number[]>(ORDER_IDS_COOKIE, {
    default: () => [],
    maxAge: 60 * 60 * 24 * 30,
})
const cartItemsCookie = useCookie<CartItem[] | null>(CART_KEY)
const customerInfoCookie = useCookie<CustomerInfo | null>(CUSTOMER_INFO_KEY)

const cartItems = ref<CartItem[] | null>([])

const isProcessing = ref(false)
const message = ref({ text: '', type: '' })

const customerInfo = ref<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    instructions: '',
})

onMounted(() => {
    if (cartItemsCookie.value) {
        cartItems.value = cartItemsCookie.value
    }

    if (customerInfoCookie.value != null) {
        customerInfo.value = customerInfoCookie.value
    }
})

const totalItems = computed((): number => {
    return cartItems.value ? cartItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0
})
const totalPrice = computed((): number => {
    return cartItems.value ? cartItems.value.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) : 0
})

const { isFormValid, errors } = useCustomerInfoValidate(customerInfo);

const cancelOrder = () => {
    cartItemsCookie.value = null
    router.push('/shop')
}

const confirmOrder = async () => {
    if (!isFormValid.value) {
        useToast().add(
            {
                title: 'Please fill in all required fields.',
                description: errors.value.name || errors.value.phone || errors.value.address,
                color: 'error',
                class: 'bg-red-200',
            }
        )
        message.value = {
            text: errors.value.name || errors.value.phone || errors.value.address,
            type: 'error',
        }
        return
    }

    isProcessing.value = true
    message.value = { text: '', type: '' }

    try {
        const payload = {
            customer_name: customerInfo.value.name,
            customer_phone: customerInfo.value.phone,
            customer_address: customerInfo.value.address,
            customer_note: customerInfo.value.instructions,
            items: cartItems.value,
            total_price: totalPrice.value,
            status: OrderStatus.Pending,
        }

        const order = await $fetch<any>('/api/orders', {
            method: 'POST',
            body: payload,
        }) as any

        // อัปเดตรายการ Order ID ใน Cookie
        orderIdsCookie.value = Array.from(new Set([...orderIdsCookie.value, order.id]))
        // ล้างข้อมูลตะกร้าใน Cookie
        cartItemsCookie.value = null
        // Save customer info to cookie
        customerInfoCookie.value = customerInfo.value

        console.log('Order placed successfully!',
            customerInfoCookie.value,
            cartItemsCookie.value,
            orderIdsCookie.value)
        // แสดงข้อความสำเร็จ
        message.value = {
            text: 'Order placed successfully!',
            type: 'success',
        }

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
onUnmounted(() => {
    // บันทึกข้อมูลลูกค้าลงใน Cookie เมื่อออกจากหน้า
    customerInfoCookie.value = customerInfo.value
})
</script>
