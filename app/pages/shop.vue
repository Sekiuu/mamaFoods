<script setup lang="ts">
import type { FoodItem, FoodOrderItem as CartItem } from '#shared/types/foods'

const { t: $t } = useI18n()
const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
const router = useRouter()
const cartCookie = useCookie<CartItem[] | null>(CART_KEY)
const loading = ref(false)
const cartOpen = ref(false)
const toast = useToast()
const isAnimating = ref(false)

const menuItems = ref<FoodItem[]>([])

onMounted(async () => {
    loading.value = true
    try {
        const res = await fetch('/api/foods')
        const data = await res.json()
        menuItems.value = data.filter((item: FoodItem) => item.show) // ✅ fix: was not assigned
    } catch (error) {
        console.error('Failed to fetch menu items:', error)
    } finally {
        loading.value = false
    }
})

const cartItems = ref<CartItem[]>([])

const addToCart = (item: CartItem) => {
    isAnimating.value = true
    setTimeout(() => isAnimating.value = false, 400)

    const existing = cartItems.value.find(
        c => c.food_id === item.food_id && JSON.stringify(c.options) === JSON.stringify(item.options)
    )

    toast.add({
        title: $t('shop.cart.added', { item: item.food_name }),
        color: 'success',
        icon: 'i-lucide-shopping-cart',
        duration: 2500,
        onClick: () => { cartOpen.value = true },
        description: $t('shop.cart.addedDesc', { item: item.food_name, count: existing ? existing.quantity + 1 : 1 }),
    })

    if (existing) {
        existing.quantity++
    } else {
        cartItems.value.push({ ...item, quantity: 1 })
    }
}

const removeFromCart = (item: CartItem) => {
    const index = cartItems.value.findIndex(
        c => c.food_id === item.food_id && JSON.stringify(c.options) === JSON.stringify(item.options)
    )
    if (index === -1) return
    const cartItem = cartItems.value[index]!
    if (cartItem.quantity > 1) {
        cartItem.quantity--
    } else {
        cartItems.value.splice(index, 1)
    }
}

const removeAll = (item: CartItem) => {
    cartItems.value = cartItems.value.filter(
        c => !(c.food_id === item.food_id && JSON.stringify(c.options) === JSON.stringify(item.options))
    )
}

const totalItems = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const totalPrice = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (Number(item.total_price) || 0) * item.quantity, 0)
)

const checkout = () => {
    cartCookie.value = cartItems.value
    cartOpen.value = false
    router.push('/checkout')
}
</script>

<template>
    <!-- extra bottom padding so content isn't hidden behind the floating footer -->
    <UPage class="mx-auto max-w-7xl px-4 py-8 pb-32">

        <!-- ── Header ── -->
        <div class="mb-8">
            <h1 class="text-4xl font-extrabold">{{ $t('shop.title') }}</h1>
            <p class="text-muted mt-2 font-light">{{ $t('shop.subtitle') }}</p>
        </div>

        <!-- ── Loading ── -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="i in 8" :key="i" class="space-y-3">
                <USkeleton class="h-44 w-full rounded-2xl" />
                <USkeleton class="h-4 w-3/4 rounded" />
                <USkeleton class="h-3 w-1/2 rounded" />
            </div>
        </div>

        <!-- ── Menu Grid ── -->
        <FoodGrid v-else :foods="menuItems" :grid-cols="4" :add-to-cart="addToCart" />

        <!-- ── Floating Footer ── -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="translate-y-full opacity-0" leave-active-class="transition-all duration-200 ease-in"
            leave-to-class="translate-y-full opacity-0">
            <div class="fixed bottom-0 inset-x-0 z-50 p-4 bg-background/80 backdrop-blur-md border-t border-default">
                <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">

                    <!-- Center: empty cart hint -->
                    <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-95"
                        leave-active-class="transition-all duration-200" leave-to-class="opacity-0 scale-95">
                        <p v-if="totalItems === 0" class="text-sm text-muted italic">
                            {{ $t('shop.cart.empty') || '👆 Tap a dish to add it to your cart' }}
                        </p>
                        <!-- Cart summary when items exist -->
                        <div v-else class="flex items-center gap-3 text-sm">
                            <UBadge :label="`${totalItems} ${$t('shop.cart.items') || 'items'}`" color="warning"
                                variant="subtle" size="lg" />
                            <span class="font-bold font-mono text-lg text-warning-600 dark:text-warning-400">
                                ฿{{ totalPrice }}
                            </span>
                        </div>
                    </Transition>

                    <!-- Right: Cart button -->
                    <UButton icon="i-lucide-shopping-cart" color="warning" size="lg"
                        :ui="{ base: 'rounded-xl', label: 'font-bold' }" :class="['transition-all duration-300 shadow-lg shadow-warning-500/20',
                            isAnimating ? 'scale-110 ring-2 ring-warning-400' : 'scale-100']" @click="cartOpen = true">
                        <span>{{ $t('shop.cart.title') }}</span>
                    </UButton>
                </div>
            </div>
        </Transition>

        <!-- ── Cart Slideover ── -->
        <USlideover v-model:open="cartOpen" side="right" :ui="{ content: 'max-w-md' }">
            <template #header>
                <div class="flex items-center gap-3 w-full">
                    <div class="p-2 rounded-xl bg-warning-100 dark:bg-warning-900">
                        <UIcon name="i-lucide-shopping-cart" class="size-5 text-warning-600" />
                    </div>
                    <div class="flex-1">
                        <p class="font-bold">{{ $t('shop.cart.title') }}</p>
                        <p class="text-xs text-muted">{{ totalItems }} {{ $t('shop.cart.items') || 'items' }} · ฿{{
                            totalPrice }}</p>
                    </div>
                    <UButton v-if="cartItems.length" :label="$t('shop.cart.clear') || 'Clear all'" color="error"
                        variant="ghost" size="xs" icon="i-lucide-trash-2" @click="cartItems = []" />
                </div>
            </template>

            <template #body>
                <!-- Empty -->
                <div v-if="cartItems.length === 0"
                    class="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <p class="text-5xl opacity-20">🍱</p>
                    <p class="font-semibold text-lg">{{ $t('shop.cart.empty') }}</p>
                    <p class="text-sm text-muted">
                        {{ $t('shop.cart.emptyDesc') || '👆 Tap a dish to add it to your cart' }}
                    </p>
                    <UButton variant="soft" color="warning" icon="i-lucide-utensils" @click="cartOpen = false">
                        {{ $t('shop.title') || 'Browse Menu' }}
                    </UButton>
                </div>

                <!-- Items -->
                <div v-else class="space-y-3">
                    <TransitionGroup enter-active-class="transition-all duration-300"
                        enter-from-class="opacity-0 -translate-x-3" leave-active-class="transition-all duration-200"
                        leave-to-class="opacity-0 translate-x-3" move-class="transition-all duration-300">
                        <div v-for="cartItem in cartItems"
                            :key="`${cartItem.food_id}-${JSON.stringify(cartItem.options)}`"
                            class="flex gap-3 p-3 rounded-2xl bg-elevated border border-default">
                            <!-- Thumbnail -->
                            <div class="size-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                                <img v-if="cartItem.food_icon" :src="cartItem.food_icon" :alt="cartItem.food_name ?? ''"
                                    class="object-cover w-full h-full" />
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <UIcon name="i-lucide-image" class="size-5 text-muted" />
                                </div>
                            </div>

                            <div class="flex-1 min-w-0 space-y-1">
                                <div class="flex items-start justify-between gap-1">
                                    <p class="font-semibold text-sm leading-tight">{{ cartItem.food_name }}</p>
                                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs"
                                        class="shrink-0 -mt-0.5 opacity-40 hover:opacity-100"
                                        @click="removeAll(cartItem)" />
                                </div>

                                <!-- Option tags -->
                                <div v-if="cartItem.options?.length" class="flex flex-wrap gap-1">
                                    <UBadge v-for="opt in cartItem.options" :key="opt.name" :label="opt.name"
                                        color="neutral" variant="soft" size="xs" />
                                </div>

                                <div class="flex items-center justify-between pt-1">
                                    <span
                                        class="text-xs text-warning-600 dark:text-warning-400 font-semibold font-mono">
                                        ฿{{ (Number(cartItem.total_price) * cartItem.quantity).toFixed(0) }}
                                    </span>
                                    <!-- Qty controls -->
                                    <div class="flex items-center gap-1">
                                        <UButton icon="i-lucide-minus" color="neutral" variant="soft" size="xs"
                                            :ui="{ base: 'rounded-lg' }" @click="removeFromCart(cartItem)" />
                                        <span class="font-mono font-bold text-sm w-6 text-center">
                                            {{ cartItem.quantity }}
                                        </span>
                                        <UButton icon="i-lucide-plus" color="warning" variant="soft" size="xs"
                                            :ui="{ base: 'rounded-lg' }" @click="addToCart(cartItem)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>
            </template>

            <!-- Footer: Order summary + checkout -->
            <template v-if="cartItems.length > 0" #footer>
                <div class="w-full space-y-3">
                    <!-- Price breakdown -->
                    <div class="flex justify-between font-bold text-base">
                        <span>
                            {{ $t('shop.cart.total') }}
                        </span>
                        <span class="font-mono text-warning-600 dark:text-warning-400 text-lg">
                            ฿{{ totalPrice }}
                        </span>
                    </div>

                    <!-- Checkout CTA -->
                    <UButton block color="warning" size="xl" icon="i-lucide-arrow-right" trailing
                        :ui="{ base: 'rounded-2xl', label: 'font-bold text-base' }" @click="checkout">
                        {{ $t('btn.order') }} · ฿{{ totalPrice }}
                    </UButton>
                </div>
            </template>

        </USlideover>
    </UPage>
</template>