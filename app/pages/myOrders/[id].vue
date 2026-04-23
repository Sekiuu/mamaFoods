
<script setup lang="ts">

import type { Order } from '#shared/types'

const poolingInterval = 3000 //3 seconds
let timer: any = null;
const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(true)

const loadOrder = async (isPolling = true) => {
    const id = Number(route.params.id)
    if (!id) {
        navigateTo('/myOrders')
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

<template>
    <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
            <div class="mb-10 flex items-center justify-between gap-4">
                <UButton to="/shop" color="neutral" variant="subtle" icon="i-lucide-arrow-left">Back to orders
                </UButton>
            </div>

            <USkeleton v-if="loading" class="flex justify-center py-20" v-for="i in 4" :key="i" />

            <div v-else-if="order">
                <OrderCard :cancelable="true" :order="ref(order)" />
            </div>

            <div v-else class="rounded-3xlp-10 shadow-sm border text-center">
                <p class="text-gray-500">Order not found.</p>
            </div>
        </div>
    </div>
</template>
