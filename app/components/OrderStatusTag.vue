<template>
    <div class="order-status-tag" :class="statusColors[status]">
        {{ status }}
    </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types/orders';

defineProps<{
    status: string;
}>()
// Colors for order status tags
const statusColors: Record<string, string> = {
    "pending": 'bg-orange-500',
    "preparing": 'bg-yellow-500',
    "delivering": 'bg-blue-500',
    "completed": 'bg-green-500',
    "cancelled": 'bg-red-500',
    "confirmed": 'bg-purple-500',
};

</script>

<style scoped>
.order-status-tag {
    @apply px-3 py-1 rounded-full text-white text-sm font-medium;
}
</style>