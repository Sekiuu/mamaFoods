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
    <div>
        <!-- food image-->
        <div class="h-48 overflow-hidden bg-gray-200 relative">
            <div class="w-full h-full flex items-center justify-center text-gray-400">
                <img :src="props.item.icon ?? ''" :alt="props.item.icon ?? ''" class="object-cover w-full h-full" />
            </div>
            <!-- price tag-->
            <div
                class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-orange-600 shadow-sm">
                ฿{{ props.item.price }}
            </div>
        </div>
        <!-- food details -->
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-1">{{ props.item.name }}</h3>
            <p class="text-gray-500 text-sm mb-6">{{ props.item.description }}</p>

            <div class="flex items-center justify-between">
                <!-- add to cart button-->
                <span v-if="props.addToCart" class="text-sm font-medium text-gray-400">
                    {{ $t('food.addToCart') }}
                </span>
                <button v-if="props.addToCart" @click="props.addToCart(props.item)"
                    class="hover:cursor-pointer bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-orange-200">
                    <span class="text-xl font-bold">+</span>
                </button>
            </div>
        </div>
    </div>
</template>