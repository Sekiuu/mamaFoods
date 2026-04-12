<script setup lang="ts">
import { useStatusConfig } from '~/composables/useStatusConfig';
const props = defineProps<{
    status: string;
}>()
const configof = useStatusConfig()
const statusConfig = computed(() => configof[props.status]);
</script>
<template>
<UBadge :color="statusConfig?.color"  :icon="statusConfig?.icon"  class="px-3 py-1 rounded-full text-sm font-medium" 
        :label="$t(`order.status.${status}`)" />
</template>
