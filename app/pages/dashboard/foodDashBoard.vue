<template>
    <AdminHeader :title="$t('admin.header.food')" :enable-back="true" />

    <UPage>
        <UContainer color="neutral" variant="soft" class="px-4 max-w-7xl">
            <!-- Header -->
            <UPageHeader class="mb-4 gap-4">
                <!-- Food Form Modal (no default slot trigger — controlled manually) -->
                <UModal v-model:open="isModalOpen" scrollable>
                    <UButton :label="$t('admin.food.createBtn')" icon="i-lucide-plus" color="primary" 
                        @click="editingFood = null"/>
                    <template #content>
                        <FoodForm :editing-food="editingFood" @food-created="onFoodSaved" @food-updated="onFoodSaved" />
                    </template>
                </UModal>

                <!-- View Mode Options -->
                <USelect v-model="viewMode" :placeholder="$t('shop.viewMode.label')" :items="[
                    { label: $t('shop.viewMode.table'), value: 'table' },
                    { label: $t('shop.viewMode.grid'), value: 'grid' },
                ]" @change="handleViewModeChange" class="mx-2" size="xl" />

                <!-- Grid Options -->
                <USelect v-if="viewMode === 'grid'" v-model.number="gridCols" title="Grid Columns"
                    placeholder="Grid Columns" :items="[
                        { label: `2 ${$t('admin.crud.search')}`, value: 2 },
                        { label: `3 ${$t('admin.crud.search')}`, value: 3 },
                        { label: `4 ${$t('admin.crud.search')}`, value: 4 }]"
                    @change="(e: any) => gridCols = parseInt(e.target.value) || 3" class="w-fit mx-2" />
            </UPageHeader>

            <!-- Food List -->
            <UAlert color="info" variant="soft" v-if="isLoading" title="Loading..." class="text-center py-8" />
            <FoodListTable v-else-if="viewMode === 'table'" :foods="foods" @edit="startEdit"
                @delete="openDeleteDialog" />
            <FoodGrid v-else :foods="foods" :grid-cols="gridCols" @edit="startEdit" @delete="openDeleteDialog" />
        </UContainer>

        <!-- Delete Confirmation Dialog -->
        <FoodDelete :food="foodToDelete" @food-deleted="loadFoods" @close="foodToDelete = null" />
    </UPage>
</template>

<script setup lang="ts">
import FoodForm from '~/components/admin/FoodForm.vue'
import FoodListTable from '~/components/admin/FoodListTable.vue'
import FoodDelete from '~/components/admin/FoodDelete.vue'
import AdminHeader from '~/components/admin/AdminHeader.vue';
import type { FoodItem } from '#shared/types';
import { json } from 'node:stream/consumers';

type ViewMode = "table" | "grid";

const foods = ref<FoodItem[]>([]);
const isLoading = ref(true);
const editingFood = ref<FoodItem | null>(null);
const foodToDelete = ref<FoodItem | null>(null);
const viewMode = ref<ViewMode>("table");
const gridCols = ref(3);
const isModalOpen = ref(false);

const loadFoods = async () => {
    isLoading.value = true;
    try {
        foods.value = await fetch("/api/foods").then((res) => res.json());
    } catch (error) {
        console.error("Error loading foods:", error);
    } finally {
        isLoading.value = false;
    }
};

const startEdit = (food: FoodItem) => {
    editingFood.value = food;
    isModalOpen.value = true;
    // console.log("Editing food:", JSON.stringify(food));
};

const onFoodSaved = () => {
    isModalOpen.value = false;
    editingFood.value = null;
    loadFoods();
};

const openDeleteDialog = (foodId: number) => {
    const food = foods.value.find((f) => f.id === foodId);
    if (food) {
        foodToDelete.value = food;
    }
};

const handleViewModeChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    viewMode.value = select.value as ViewMode;
};

onMounted(() => {
    loadFoods();
});
</script>