<template>
    <PageHeader title="Order Dashboard" :enable-logout="false">
        <template #actions>
            <NuxtLink to="/admin" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-4">
                Back to Dashboard
            </NuxtLink>
        </template>
    </PageHeader>
    <div class="admin-dashboard">
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1">
                    <UserForm :editing-user="editingUser" @user-created="loadUsers" @user-updated="loadUsers"
                        @clear="editingUser = null" />
                </div>

                <div class="lg:col-span-2">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div class="flex gap-3 items-center">
                            <input v-model="searchName" type="text" placeholder="Search by name..."
                                class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <select v-model.number="rowsPerPage"
                                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option :value="5">5 rows</option>
                                <option :value="10">10 rows</option>
                                <option :value="20">20 rows</option>
                                <option :value="50">50 rows</option>
                            </select>
                        </div>

                        <div class="text-sm text-gray-600">
                            Showing <strong>{{ paginatedUsers.length }}</strong> of
                            <strong>{{ filteredUsers.length }}</strong>
                        </div>
                    </div>

                    <div v-if="isLoading" class="text-center py-8">
                        <p class="text-gray-500">Loading users...</p>
                    </div>

                    <UserListTable v-else :users="paginatedUsers" @edit="startEdit" @delete="openDeleteDialog" />

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
        </div>

        <UserDelete :user="userToDelete" @user-deleted="loadUsers" @close="userToDelete = null" />
    </div>
</template>

<script setup lang="ts">
import UserForm from "~/components/admin/UserForm.vue";
import UserListTable from "~/components/admin/UserListTable.vue";
import UserDelete from "~/components/admin/UserDelete.vue";
import PageHeader from "~/components/admin/PageHeader.vue";
import type { UserItem } from "~/types";
import { useSearch } from "~/composables/useSearch";
import { usePagination } from "~/composables/usePagination";

const users = ref<UserItem[]>([]);
const isLoading = ref(true);
const editingUser = ref<UserItem | null>(null);
const userToDelete = ref<UserItem | null>(null);

const userSearch = useSearch(users);
const pagination = usePagination(userSearch.filterd, { initialRowsPerPage: 10, initialPage: 1 });

const loadUsers = async () => {
    isLoading.value = true;
    try {
        users.value = await $fetch<UserItem[]>("/api/users");
        editingUser.value = null;
    } catch (error) {
        console.error("Error loading users:", error);
    } finally {
        isLoading.value = false;
    }
};

const startEdit = (user: UserItem) => {
    editingUser.value = user;
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const openDeleteDialog = (userId: number) => {
    const user = users.value.find((u) => u.id === userId);
    if (user) userToDelete.value = user;
};

const filteredUsers = computed(() => userSearch.filterd.value);
const paginatedUsers = computed(() => pagination.paginated.value);
const totalPages = computed(() => pagination.totalPages.value);
const page = pagination.page;
const rowsPerPage = pagination.rowsPerPage;
const searchName = userSearch.searchName;

onMounted(() => {
    loadUsers();
});
</script>

<style scoped>
.admin-dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding-bottom: 40px;
}
</style>
