<template>
    <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
            <div class="mb-10 flex items-center justify-between gap-4">
                <NuxtLink to="/shop"
                    class="rounded-2xl bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 transition">Back to orders
                </NuxtLink>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>

            <div v-else-if="order">
                <OrderCard :cancelable="true" :order="ref(order)" />
            </div>

            <div v-else class="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
                <p class="text-gray-500">Order not found.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import type { Order } from '~/types'

const poolingInterval = 3000 //3 seconds
let timer: any = null;
const route = useRoute()
const router = useRouter()
const order = ref<Order | null>(null)
const loading = ref(true)

const loadOrder = async (isPolling = true) => {
    const id = Number(route.params.id)
    if (!id) {
        router.push('/myOrders')
        return
    }

    loading.value = true && !isPolling
    try {
        const data: any = await $fetch(`/api/orders/${id}`)
        order.value = data
    } catch (error) {
        console.error('Failed to fetch order:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadOrder(false)
    timer = setInterval(loadOrder, poolingInterval)
})
onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>
