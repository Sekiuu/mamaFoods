<script setup lang="ts">
const props = defineProps<{
    orderItems: Array<CartItem>
}>()
</script>
<template>
    <UContainer class="divide-y divide-default">
        <div v-for="item in props.orderItems" :key="item.food_id"
            class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <!-- Left: image + info -->
            <div class="flex items-center gap-4 min-w-0">
                <UAvatar :src="item.food_icon" :alt="item.food_name ?? ''" size="xl"
                    :ui="{ root: 'rounded-xl shrink-0' }" />
                <div class="min-w-0">
                    <p class="font-semibold truncate">{{ item.food_name }}</p>
                    <p class="text-sm text-muted truncate">{{ item.food_discription }}</p>
                    <!-- Options -->
                    <div v-if="item.options?.length" class="mt-1 flex flex-wrap gap-1">
                        <UBadge v-for="opt in item.options" :key="opt.name" :label="`+ ${opt.name} (฿${opt.price})`"
                            color="warning" variant="subtle" size="md" />
                    </div>
                </div>
            </div>

            <!-- Right: price -->
            <div class="text-right shrink-0">
                <p class="font-semibold">฿{{ item.total_price }}</p>
                <p class="text-sm text-muted">( ฿{{ item.food_price }}
                    {{
                        item.options?.length ?
                            item.options.map((opt) => (
                                opt.price > 0 ? `+ ฿${opt.price} ` : ''
                            )).join('')
                            : ''
                    }})
                    × {{ item.quantity }}</p>
            </div>
        </div>
    </UContainer>
</template>