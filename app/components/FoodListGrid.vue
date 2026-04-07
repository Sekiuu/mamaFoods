<template>
    <div class="food-list-container">
        <h2 class="text-2xl font-bold mb-4">Food Items</h2>
        <div class="overflow-x-auto">
            <div class="grid gap-6" :style="gridStyle">
                <div v-for="item in foods" :key="item.id"
                    class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <FoodCard :item="item" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FoodItem } from "~/types"

const DEFAULT_COLS = 3;

const props = defineProps<{
    foods: FoodItem[];
    gridCols?: number;
}>();

const cols = computed(() => {
    return props.gridCols && props.gridCols > 0 ? props.gridCols : DEFAULT_COLS;
});

const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
}));

defineEmits<{
    edit: [food: FoodItem];
    delete: [id: number];
}>();
</script>