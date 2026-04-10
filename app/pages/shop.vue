<template>
    <UPage class="mx-auto max-w-7xl px-4 py-8">

        <!-- Header -->
        <UPageHeader class="mb-10">
            <h1 class="text-4xl font-extrabold">{{ $t('shop.title') }}</h1>
            <p class="text-muted mt-2">{{ $t('shop.subtitle') }}</p>
        </UPageHeader>

        <!-- Loading Spinner -->
        <UPageCard v-if="loading" class="flex justify-center items-center h-64">
            <UIcon name="i-lucide-loader-circle" class="size-12 text-warning animate-spin" />
        </UPageCard>

        <UPageBody v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">

            <!-- Menu Items — takes 2/3 -->
            <FoodGrid :foods="menuItems" :addToCart="addToCart" class="lg:col-span-3 p-0" />

            <!-- Cart — takes 1/3 -->
            <div class="lg:col-span-1">
                <UCard :ui="{ root: 'rounded-3xl sticky top-6' }">
                    <template #header>
                        <h2 class="text-2xl font-bold flex items-center gap-2">
                            {{ $t('shop.cart.title') }}
                            <span class="text-sm font-normal text-muted">
                                ({{ totalItems }} {{ $t('shop.cart.items') }})
                            </span>
                        </h2>
                    </template>

                    <!-- Empty Cart -->
                    <div v-if="cartItems.length === 0" class="py-12 text-center">
                        <p class="text-4xl mb-4 opacity-20">🍱</p>
                        <p class="text-muted">{{ $t('shop.cart.empty') }}</p>
                    </div>

                    <!-- Cart Items -->
                    <div v-else class="space-y-3">
                        <div v-for="cartItem in cartItems" :key="cartItem.id"
                            class="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                            <div class="min-w-0 mr-2">
                                <p class="font-bold text-sm truncate">{{ cartItem.name }}</p>
                                <p class="text-xs text-muted">฿{{ cartItem.price }} x {{ cartItem.quantity }}</p>
                            </div>
                            <div class="flex items-center gap-1 shrink-0">
                                <UButton icon="i-lucide-minus" color="neutral" variant="ghost" size="xs"
                                    @click="removeFromCart(cartItem.id)" />
                                <span class="font-mono text-sm w-5 text-center">{{ cartItem.quantity }}</span>
                                <UButton icon="i-lucide-plus" color="warning" variant="ghost" size="xs"
                                    @click="addToCart(cartItem)" />
                            </div>
                        </div>
                    </div>

                    <!-- Checkout -->
                    <template v-if="cartItems.length > 0" #footer>
                        <USeparator class="mb-4" />
                        <div class="flex justify-between text-lg font-bold mb-4">
                            <span class="text-muted">{{ $t('shop.cart.total') }}</span>
                            <span class="text-warning font-mono text-xl">฿{{ totalPrice }}</span>
                        </div>
                        <UButton block color="neutral" size="xl" class="rounded-2xl font-bold" @click="checkout">
                            {{ $t('shop.cart.checkout') }}
                        </UButton>
                    </template>
                </UCard>
            </div>

        </UPageBody>
    </UPage>
</template>



<script setup lang="ts">
const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
const router = useRouter()
const cartCookie = useCookie<CartItem[] | null>(CART_KEY)
const loading = ref(false)
import type { FoodItem } from '~/types'

interface CartItem extends FoodItem {
    quantity: number
}

const menuItems = ref<FoodItem[]>([])

onMounted(async () => {
    loading.value = true
    try {
        const res = await fetch('/api/foods')
        menuItems.value = await res.json()
    } catch (error) {
        console.error('Failed to fetch menu items:', error)
    } finally {
        loading.value = false
    }
})

const cartItems = ref<CartItem[]>([])

const addToCart = (item: FoodItem) => {
    const existing = cartItems.value.find((c): c is CartItem => c.id === item.id)
    if (existing) {
        existing.quantity++
    } else {
        cartItems.value.push({ ...item, quantity: 1 })
    }
}

const removeFromCart = (id: number) => {
    const index = cartItems.value.findIndex(c => c.id === id)
    if (index !== -1) {
        const cartItem = cartItems.value[index]
        if (!cartItem) return
        if (cartItem.quantity > 1) {
            cartItem.quantity--
        } else {
            cartItems.value.splice(index, 1)
        }
    }
}

const totalItems = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const totalPrice = computed(() =>
    // Ensure price is treated as number for calculation
    cartItems.value.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0)
)

const checkout = () => {
    cartCookie.value = cartItems.value
    router.push('/checkout')
}
</script>
