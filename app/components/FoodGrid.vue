<template>
    <div class="space-y-4">
        <h2 v-if="title" class="text-2xl font-bold">{{ title }}</h2>

        <div class="grid gap-6" :class="gridClass">
            <FoodCard v-for="item in foods" 
            :key="item.id" :item="item" 
            :add-to-cart="addToCart" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FoodItem } from '~/types'

const DEFAULT_COLS = 3

const props = defineProps<{
    foods: FoodItem[]
    addToCart?: (item: FoodItem) => void
    gridCols?: number
    title?: string
}>()

defineEmits<{
    edit: [food: FoodItem]
    delete: [id: number]
}>()

const cols = computed(() => {
    return props.gridCols && props.gridCols > 0 ? props.gridCols : DEFAULT_COLS
})

// Responsive: always 1 col on mobile, 2 on tablet, gridCols on desktop
const gridClass = computed(() => {
    const desktopCols: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3 grid-cols-1',
        4: 'sm:grid-cols-2 lg:grid-cols-4 grid-cols-1',
        5: 'sm:grid-cols-2 lg:grid-cols-5 grid-cols-1',
        6: 'sm:grid-cols-2 lg:grid-cols-6 grid-cols-1',
    }
    return desktopCols[cols.value] ?? 'sm:grid-cols-2 lg:grid-cols-3 grid-cols-1'
})
</script>
