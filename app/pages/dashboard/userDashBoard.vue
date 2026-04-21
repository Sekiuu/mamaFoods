<template>
    <AdminHeader title="User Management" :enable-back="true"/>
    <UCard>
        <div class="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
                <UserForm :editing-user="editingUser" @user-created="loadUsers" @user-updated="loadUsers"
                    @clear="editingUser = null" />
            </div>

            <div class="lg:col-span-2">
                <UAlert v-if="isLoading" title="Loading users..." color="neutral" variant="subtle" />

                <UserListTable v-else :users="users" @edit="startEdit" @delete="openDeleteDialog" />
            </div>
        </div>

        <UserDelete :user="userToDelete" @user-deleted="loadUsers" @close="userToDelete = null" />
    </UCard>
</template>

<script setup lang="ts">
import UserForm from "~/components/admin/UserForm.vue";
import UserListTable from "~/components/admin/UserListTable.vue";
import UserDelete from "~/components/admin/UserDelete.vue";
import AdminHeader from '~/components/admin/AdminHeader.vue'
import type { UserItem } from "#shared/types";

const users = ref<UserItem[]>([]);
const isLoading = ref(true);
const editingUser = ref<UserItem | null>(null);
const userToDelete = ref<UserItem | null>(null);

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
