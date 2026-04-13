<script setup lang="ts">
import type { FoodItem } from '~/types'

const { t: $t } = useI18n()
const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
const router = useRouter()
const cartCookie = useCookie<CartItem[] | null>(CART_KEY)
const loading = ref(false)
const cartOpen = ref(false)
const toast = useToast()
const isAnimating = ref(false)
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
    isAnimating.value = true
    setTimeout(() => isAnimating.value = false, 300)
    const existing = cartItems.value.find((c): c is CartItem => c.id === item.id)
    toast.add({
        title: $t('shop.cart.added', { item: item.name }),
        color: 'success',
        description: $t('shop.cart.addedDesc', { item: item.name, count: existing ? existing.quantity + 1 : 1 }),
    })
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
    cartItems.value.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0)
)

const checkout = () => {
    cartCookie.value = cartItems.value
    router.push('/checkout')
}
</script>
<template>
    <UPage class="mx-auto max-w-7xl px-4 py-8">

        <!-- Header -->
        <UContainer color="neutral" variant="soft" class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-4xl font-extrabold">{{ $t('shop.title') }}</h1>
                <p class="text-muted mt-2 font-light">{{ $t('shop.subtitle') }}</p>
            </div>
        </UContainer>

        <!-- Sticky Cart Button (fixed under navbar) -->
        <div class="fixed right-6 md:right-1/10 z-50" style="top: calc(var(--ui-header-height) + 1rem)">
            <USlideover v-model:open="cartOpen" side="right" :title="$t('shop.cart.title')">

                <!-- Trigger -->
                <UChip :text="totalItems" size="2xl" :show="totalItems > 0" color="warning">
                    <UButton icon="i-lucide-shopping-cart" color="neutral" variant="soft" size="xl"
                        class="rounded-xl shadow-lg transition-all duration-300"
                        :class="{ 'scale-150 ring-2 ring-warning-500': isAnimating }" @click="cartOpen = true" />
                </UChip>

                <!-- Slideover body -->
                <template #body>
                    <div v-if="cartItems.length === 0"
                        class="py-12 text-center h-full flex flex-col items-center justify-center">
                        <p class="text-4xl mb-4 opacity-20">🍱</p>
                        <p class="text-muted">{{ $t('shop.cart.empty') }}</p>
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="cartItem in cartItems" :key="cartItem.id"
                            class="flex justify-between items-center bg-elevated p-3 rounded-2xl">
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
                </template>

                <!-- Slideover footer -->
                <template v-if="cartItems.length > 0" #footer>
                    <div class="w-full space-y-4">
                        <div class="flex justify-between text-lg font-bold">
                            <span class="text-muted">{{ $t('shop.cart.total') }}</span>
                            <span class="text-warning font-mono text-xl">฿{{ totalPrice }}</span>
                        </div>
                        <UButton block color="neutral" size="xl" class="rounded-2xl font-bold" @click="checkout">
                            {{ $t('shop.cart.checkout') }}
                        </UButton>
                    </div>
                </template>

            </USlideover>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading" class="flex justify-center items-center h-64">
            <UIcon name="i-lucide-loader-circle" class="size-12 text-warning animate-spin" />
        </div>

        <!-- Menu Grid -->
        <FoodGrid v-else :foods="menuItems" :grid-cols="4" :add-to-cart="addToCart" />

    </UPage>
</template>
