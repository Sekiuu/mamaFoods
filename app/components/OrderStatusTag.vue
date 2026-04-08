<template>
    <div class="px-3 py-1 rounded-full text-white text-sm font-medium " :class="statusColors[status]">
        {{ $t(`order.status.${status}`) }}
    </div>
</template>

<script setup lang="ts">
import { useStatusColor } from '~/composables/useStatusColor';
const statusColors = useStatusColor()
defineProps<{
    status: string;
}>()
</script>