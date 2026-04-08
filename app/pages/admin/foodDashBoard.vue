<template>
    <PageHeader title="Order Dashboard" :enable-logout="false">
        <template #actions>
            <NuxtLink to="/admin" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-4">
                Back to Dashboard
            </NuxtLink>
        </template>
    </PageHeader>

    <main class="admin-dashboard">
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Form -->
                <div class="lg:col-span-1">
                    <FoodForm :editing-food="editingFood" @food-created="loadFoods" @food-updated="loadFoods" />
                </div>

                <!-- Right Column: List -->
                <div class="lg:col-span-2">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex gap-3 justify-center">
                            <!-- Search Bar-->
                            <input v-model="searchName" type="text" placeholder="Search by name..."
                                class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

                            <!-- View Mode Options -->
                            <select name="viewMode" id="viewMode" @change="handleViewModeChange"
                                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="grid">Grid</option>
                                <option value="table" selected>Table</option>
                            </select>
                            <!-- grid options -->
                            <select v-if="viewMode === 'grid'" v-model.number="gridCols"
                                @change="(e: any) => gridCols = parseInt(e.target.value) || 3"
                                class="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="2">2 columns</option>
                                <option value="3">3 columns</option>
                                <option value="4">4 columns</option>
                            </select>
                            <!-- Pagination -->
                            <select v-model.number="rowsPerPage"
                                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option :value="5">5 rows</option>
                                <option :value="10">10 rows</option>
                                <option :value="20">20 rows</option>
                                <option :value="50">50 rows</option>
                            </select>
                        </div>

                        <!-- Pagination info -->
                        <div class="text-sm text-gray-600">
                            Showing <strong>{{ paginatedFoods.length }}</strong> of
                            <strong>{{ searchFood.filterd.value.length }}</strong>
                        </div>
                    </div>
                    <!-- Food List -->
                    <div v-if="isLoading" class="text-center py-8">
                        <p class="text-gray-500">Loading foods...</p>
                    </div>
                    <FoodListTable v-else-if="viewMode === 'table'" :foods="paginatedFoods" @edit="startEdit"
                        @delete="openDeleteDialog" />
                    <FoodListGrid v-else :foods="paginatedFoods" :grid-cols="gridCols" @edit="startEdit"
                        @delete="openDeleteDialog" />
                </div>
                <!-- Pagination Controls-->
                <div v-if="!isLoading && totalPages > 1" class="flex items-center justify-between mt-4">
                    <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        :disabled="page === 1" @click="page = Math.max(1, page - 1)">
                        Prev
                    </button>
                    <div class="text-sm text-gray-700">
                        Page {{ page }} of {{ totalPages }}
                    </div>
                    <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        :disabled="page === totalPages" @click="page = Math.min(totalPages, page + 1)">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <FoodDelete :food="foodToDelete" @food-deleted="loadFoods" @close="foodToDelete = null" />
    </main>
</template>

<script setup lang="ts">
import FoodForm from '~/components/admin/FoodForm.vue'
import FoodListTable from '~/components/admin/FoodListTable.vue'
import FoodDelete from '~/components/admin/FoodDelete.vue'
import PageHeader  from '~/components/admin/AdminHeader.vue'
import { useSearch } from "~/composables/useSearch";

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

const rowsPerPage = ref(5);
const gridCols = ref(3);
const page = ref(1);

const searchFood = useSearch(foods);
const searchName = searchFood.searchName;
const filteredFoods = computed(() => searchFood.filterd.value);

const paginatedFoods = computed(() => {
    if (viewMode.value === "table") {
        const start = (page.value - 1) * rowsPerPage.value;
        return filteredFoods.value.slice(start, start + rowsPerPage.value);
    }
    const start = (page.value - 1) * rowsPerPage.value * gridCols.value;
    return filteredFoods.value.slice(start, start + rowsPerPage.value);
});
const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredFoods.value.length / rowsPerPage.value)),
);

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
