<template>
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">

            <!-- Header -->
            <div class="flex justify-between items-end mb-10">
                <div>
                    <h1 class="text-4xl font-extrabold text-gray-900">{{ $t('shop.title') }}</h1>
                    <p class="text-gray-600 mt-2">{{ $t('shop.subtitle') }}</p>
                </div>
            </div>

            <!-- Loading Spinner -->
            <div v-if="loading" class="flex justify-center items-center h-screen">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <!-- Body Section -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <!-- Menu Items Section-->
                <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div v-if="menuItems.length > 0" v-for="item in menuItems" :key="item.id"
                        class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <FoodCard :item="item" :addToCart="addToCart" />
                    </div>
                <!-- in case of empty menu -->
                    <div v-else class="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
                        <p class="text-gray-500">{{ $t('shop.empty') }}</p>
                    </div>
                </div>

                <!-- Cart Section-->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            {{ $t("shop.cart.title") }}
                            <span class="ml-3 text-sm font-normal text-gray-400">
                                ({{ totalItems }} {{ $t('shop.cart.items') }})</span>
                        </h2>
                        <!-- in case of empty cart -->
                        <div v-if="cartItems.length === 0" class="py-12 text-center">
                            <div class="text-4xl mb-4 opacity-20">🍱</div>
                            <p class="text-gray-400">
                                {{ $t('shop.cart.empty') }}
                            </p>
                        </div>

                        <!-- in case of non-empty cart -->
                        <div v-else class="space-y-4 mb-8">
                            <div v-for="cartItem in cartItems" :key="cartItem.id"
                                class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                <div class="flex items-center gap-3">

                                    <div>
                                        <p class="font-bold text-gray-800 text-sm">{{ cartItem.name }}</p>
                                        <p class="text-xs text-gray-500">฿{{ cartItem.price }} x {{ cartItem.quantity }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button @click="removeFromCart(cartItem.id)"
                                        class="hover:cursor-pointer text-gray-400 hover:text-red-500 font-bold px-2">
                                        -
                                    </button>

                                    <span class="font-mono text-sm text-gray-600">{{ cartItem.quantity }}</span>

                                    <button @click="addToCart(cartItem)"
                                        class="hover:cursor-pointer text-orange-500 font-bold px-2">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- horizontal line for seperate sections form check out button -->
                        <hr v-if="cartItems.length > 0" class="border-gray-100 mb-6">
                        <!-- checkout button-->
                        <div v-if="cartItems.length > 0">
                            <div class="flex justify-between text-lg mb-6 font-bold">
                                <span class="text-gray-600">
                                    {{ $t('shop.cart.total') }}
                                </span>
                                <span class="text-orange-600 font-mono text-xl">฿{{ totalPrice }}</span>
                            </div>
                            <button @click="checkout"
                                class="hover:cursor-pointer w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg">
                                {{ $t('shop.cart.checkout') }}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const CART_KEY = process.env.CART_KEY || 'mamaFoodCart'
const router = useRouter()
const cartCookie = useCookie<CartItem[] | null>(CART_KEY)
const loading = ref(false)
interface MenuItem {
    id: number
    name: string
    price: number
    description: string
    icon: string
}

interface CartItem extends MenuItem {
    quantity: number
}

const menuItems = ref<MenuItem[]>([])
// real data from api
//if no api, use dummy data
// menuItems.value = [
//     { id: 1, name: "Burger", price: 10, description: "A juicy burger", icon: "🍔" },
//     { id: 2, name: "Pizza", price: 15, description: "A delicious pizza", icon: "🍕" },
//     { id: 3, name: "Sushi", price: 20, description: "Fresh sushi rolls", icon: "🍣" },
//     { id: 4, name: "Salad", price: 8, description: "A healthy salad", icon: "🥗" },
//     { id: 5, name: "Ice Cream", price: 5, description: "A sweet treat", icon: "🍨" },
// ]

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

// Logic
const addToCart = (item: MenuItem) => {
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
        if (cartItem == undefined || cartItem == null) return;

        if (cartItem.quantity > 1) {
            cartItem.quantity--
        } else {
            cartItems.value.splice(index, 1)
        }
    }
}

const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})
const checkout = () => {
    // บันทึกตะกร้าลงใน Cookie (cartItems คือข้อมูลปัจจุบันในหน้า shop)
    cartCookie.value = cartItems.value
    // Redirect to checkout page
    router.push('/checkout')
}
</script>