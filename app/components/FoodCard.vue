<script setup lang="ts">
const props = defineProps<{
    item: {
        id: number
        name?: string | null
        price?: string | number | null
        description?: string | null
        icon?: string | null
    }
    addToCart?: (item: any) => void
}>()
</script>

<template>
    <UCard :ui="{ body: 'p-0', root: 'overflow-hidden' }">
        <!-- Food Image -->
        <div class="h-48 relative overflow-hidden bg-gray-200 rounded-2xl">
            <img :src="props.item.icon ?? ''" :alt="props.item.name ?? ''" class="object-cover w-full h-full" />
            <!-- Price Tag -->
            <div
                class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-orange-600 shadow-sm">
                ฿{{ props.item.price }}
            </div>
        </div>

        <!-- Food Details -->
        <div class="p-6 whitespace-break-spaces break-all">
            <h3 class="text-xl font-bold mb-1">{{ props.item.name }}</h3>
            <p class="text-sm text-muted mb-6">{{ props.item.description }}</p>

            <div v-if="props.addToCart" class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted">
                    {{ $t('food.addToCart') }}
                </span>
                <UButton color="warning" icon="i-lucide-plus" size="lg"
                    class="rounded-xl shadow-lg shadow-orange-200 active:scale-90 transition-all"
                    @click="props.addToCart(props.item)" />
            </div>
        </div>
    </UCard>
</template>
