<template>
    <div class="food-list-container">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Food Items</h2>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border-collapse border border-gray-300">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="border border-gray-300 px-4 py-2 text-left">ID</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">Price</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">Description</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">Icon</th>
                        <th class="border border-gray-300 px-4 py-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="foods.length === 0">
                        <td colspan="6" class="border border-gray-300 px-4 py-2 text-center text-gray-500">
                            No food items found
                        </td>
                    </tr>
                    <tr v-for="food in foods" :key="food.id" class="hover:bg-gray-100">
                        <td class="border border-gray-300 px-4 py-2">{{ food.id }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ food.name }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ food.price }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ food.description }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ food.icon }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-center space-x-2">
                            <button @click="$emit('edit', food)"
                                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Edit
                            </button>
                            <button @click="$emit('delete', food.id)"
                                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FoodItem } from "../../types"

defineProps<{
    foods: FoodItem[];
}>();

defineEmits<{
    edit: [food: FoodItem];
    delete: [id: number];
}>();
</script>

<style scoped>
.food-list-container {
    padding: 20px;
    background-color: #f9fafb;
    border-radius: 8px;
}
</style>
