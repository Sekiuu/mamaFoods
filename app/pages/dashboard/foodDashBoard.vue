<template>
    <AdminHeader title="Food Dashboard" :enable-back="true" />

    <UPage>
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Form -->
                <div class="lg:col-span-1">
                    <FoodForm :editing-food="editingFood" @food-created="loadFoods" @food-updated="loadFoods" />
                </div>

                <!-- Right Column: List -->
                <div class="lg:col-span-2">
                    <!-- Header -->
                    <UPageHeader class="mb-4 gap-4" >
                        <!-- View Mode Options -->
                        <USelect v-model="viewMode" placeholder="View Mode" :items="[
                            { label: 'Table', value: 'table' },
                            { label: 'Grid', value: 'grid' },
                            ]"
                            @change="handleViewModeChange" 
                            class="w-fit mx-2"/>
                        <!-- grid options -->
                        <USelect v-if="viewMode === 'grid'" v-model.number="gridCols" title="Grid Collums"
                            placeholder="Grid Collums" :items="[
                                { label: '2 collums', value: 2 },
                                { label: '3 collums', value: 3 }, 
                                { label: '4 collums', value: 4 }]"
                            @change="(e: any) => gridCols = parseInt(e.target.value) || 3"
                            class="w-fit mx-2" />
                    </UPageHeader>
                    <!-- Food List -->
                    <UAlert color="info" variant="soft" v-if="isLoading" title="Loading..." class="text-center py-8" />
                    <FoodListTable v-else-if="viewMode === 'table'" :foods="foods" @edit="startEdit"
                        @delete="openDeleteDialog" />
                    <FoodGrid v-else :foods="foods" :grid-cols="gridCols" @edit="startEdit"
                        @delete="openDeleteDialog" />
                </div>

            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <FoodDelete :food="foodToDelete" @food-deleted="loadFoods" @close="foodToDelete = null" />
    </UPage>
</template>

<script setup lang="ts">
import FoodForm from '~/components/admin/FoodForm.vue'
import FoodListTable from '~/components/admin/FoodListTable.vue'
import FoodDelete from '~/components/admin/FoodDelete.vue'
import PageHeader from '~/components/admin/AdminHeader.vue'
import AdminHeader from '~/components/admin/AdminHeader.vue';

interface Food {
    id: number;
    name?: string | null;
    price?: string | null;
    description?: string | null;
    icon?: string | null;
    last_edit?: Date | null;
}
type ViewMode = "table" | "grid";

const foods = ref<Food[]>([]);
const isLoading = ref(true);
const editingFood = ref<Food | null>(null);
const foodToDelete = ref<Food | null>(null);
const viewMode = ref<ViewMode>("table");
const gridCols = ref(3);

const loadFoods = async () => {
    isLoading.value = true;
    try {
        foods.value = await fetch("/api/foods").then((res) => res.json());
        editingFood.value = null;
    } catch (error) {
        console.error("Error loading foods:", error);
    } finally {
        isLoading.value = false;
    }
};

const startEdit = (food: Food) => {
    editingFood.value = food;
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const openDeleteDialog = (foodId: number) => {
    const food = foods.value.find((f) => f.id === foodId);
    if (food) {
        foodToDelete.value = food;
    }
};

const handleViewModeChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    // Handle view mode change logic here
    console.log("Selected view mode:", select.value);
    viewMode.value = select.value as ViewMode;
};

onMounted(() => {

    loadFoods();
});
</script>

<style scoped>
.admin-dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding-bottom: 40px;
}
</style>
