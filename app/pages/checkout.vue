<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { CartItem, CustomerInfo } from '#shared/types'
import { OrderStatus } from '#shared/types/orders'

definePageMeta({
    middleware: ['auth-cart']
})

const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
const CUSTOMER_INFO_KEY = process.env.CUSTOMER_INFO_KEY || 'mamaFoodCustomerInfo'
const ORDER_IDS_COOKIE = process.env.ORDER_IDS_COOKIE || 'mamaFoodOrderIds'

const router = useRouter()
const toast = useToast()

const orderIdsCookie = useCookie<number[]>(ORDER_IDS_COOKIE, {
    default: () => [],
    maxAge: 60 * 60 * 24 * 30,
})
const cartItemsCookie = useCookie<CartItem[] | null>(CART_KEY)
const customerInfoCookie = useCookie<CustomerInfo | null>(CUSTOMER_INFO_KEY)

const cartItems = ref<CartItem[]>([])
const isProcessing = ref(false)

const state = reactive<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    instructions: '',
})

onMounted(() => {
    if (cartItemsCookie.value) cartItems.value = cartItemsCookie.value
    if (customerInfoCookie.value) Object.assign(state, customerInfoCookie.value)
})

onUnmounted(() => {
    customerInfoCookie.value = { ...state }
})

// ── Computed ──────────────────────────────────────────────────
const totalItems = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
)

const totalPrice = computed(() =>
    cartItems.value.reduce((sum, item) => sum + ((item.total_price || 0) * (item.quantity || 0)), 0)
)

// ── Validation ────────────────────────────────────────────────
const validate = (data: Partial<CustomerInfo>): FormError[] => {
    const errors: FormError[] = []
    if (!data.name?.trim()) errors.push({ name: 'name', message: 'Full name is required' })
    if (!data.phone?.trim()) errors.push({ name: 'phone', message: 'Phone number is required' })
    if (!data.address?.trim()) errors.push({ name: 'address', message: 'Delivery address is required' })
    return errors
}

// ── Actions ───────────────────────────────────────────────────
const cancelOrder = () => {
    cartItemsCookie.value = null
    router.push('/shop')
}

const confirmOrder = async (_event: FormSubmitEvent<CustomerInfo>) => {
    isProcessing.value = true
    try {
        const payload = {
            customer_name: state.name,
            customer_phone: state.phone,
            customer_address: state.address,
            customer_note: state.instructions,
            items: cartItems.value,
            total_price: totalPrice.value,
            status: OrderStatus.Pending,
        }

        const order = await $fetch<{ id: number }>('/api/orders', {
            method: 'POST',
            body: payload,
        })

        orderIdsCookie.value = Array.from(new Set([...orderIdsCookie.value, order.id]))
        cartItemsCookie.value = null
        customerInfoCookie.value = { ...state }

        toast.add({
            title: 'Order placed successfully!',
            description: `Order #${order.id} is being prepared.`,
            color: 'success',
            icon: 'i-lucide-check-circle',
        })

        router.push(`/myOrders/${order.id}`)
    } catch {
        toast.add({
            title: 'Failed to place order',
            description: 'Please try again.',
            color: 'error',
            icon: 'i-lucide-x-circle',
        })
    } finally {
        isProcessing.value = false
    }
}
</script>

<template>
    <UPage class="mx-auto max-w-7xl px-4 py-8">
        <UPageHeader :title="$t('checkout.subtitle')" icon="i-lucide-shopping-bag"
            :ui="{ title: 'text-2xl font-bold text-center w-full' }" />

        <UPageBody class="max-w-2xl mx-auto space-y-6">
            <!-- ── Order Summary ── -->
            <UCard>
                <template #header>
                    <p class="text-xl font-bold">{{ $t('checkout.orderSummary.title') }}</p>
                </template>

                <!-- Items -->
                <div class="divide-y divide-default">
                    <OrderedFoodItemsList :order-items="cartItems" />
                </div>

                <template #footer>
                    <div class="space-y-1">
                        <div class="flex justify-between items-center text-xl font-bold">
                            <span>{{ $t('checkout.orderSummary.total') }}</span>
                            <span class="text-primary font-mono">฿{{ totalPrice }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-muted">
                            <span>{{ $t('checkout.orderSummary.totalItems') }}</span>
                            <span>{{ totalItems }}</span>
                        </div>
                    </div>
                </template>
            </UCard>
            <!-- ── Customer Info Form ── -->
            <UForm :state="state" :validate="validate" :validate-on="['change', 'blur']" class="space-y-5"
                @submit="confirmOrder">
                <UCard :ui="{ body: 'p-6 space-y-4',}">
                    <template #header>
                        <p class="text-xl font-bold">{{ $t('customerInfo.title') }}</p>
                    </template>
                    <!-- Name + Phone row -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField :label="$t('customerInfo.name')" name="name" required>
                            <UInput v-model="state.name" placeholder="Enter your full name" leading-icon="i-lucide-user"
                                class="w-full" />
                        </UFormField>

                        <UFormField :label="$t('customerInfo.phone')" name="phone" required>
                            <UInput v-model="state.phone" type="tel" placeholder="Enter your phone number"
                                leading-icon="i-lucide-phone" class="w-full" />
                        </UFormField>
                    </div>

                    <!-- Address -->
                    <UFormField :label="$t('customerInfo.address')" name="address" required>
                        <UTextarea v-model="state.address" placeholder="Enter your delivery address" :rows="3"
                            class="w-full" />
                    </UFormField>

                    <!-- Note -->
                    <UFormField :label="$t('customerInfo.note')" name="instructions">
                        <UTextarea v-model="state.instructions" placeholder="Any special requests or instructions..."
                            :rows="2" class="w-full" />
                    </UFormField>

                    <!-- Action buttons inside the form so submit works -->
                    <div class="flex gap-3 pt-2">
                        <UButton label="Cancel Order" color="neutral" variant="outline" icon="i-lucide-x" block
                            type="button" @click="cancelOrder" />
                        <UButton :label="isProcessing ? 'Processing...' : 'Confirm Order'" color="primary"
                            icon="i-lucide-check" block type="submit" :loading="isProcessing" />
                    </div>
                </UCard>
            </UForm>
        </UPageBody>
    </UPage>
</template>