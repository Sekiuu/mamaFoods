<template>
    <PageHeader title="Admin Dashboard" :enable-logout="true">
    </PageHeader>
    <div class="min-h-screen bg-gray-100">

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Food Management -->
                    <DashboardCard title="Food Management" description="Manage menu items">
                        <template #icon>
                            <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </template>
                        <template #actions>
                            <NuxtLink to="/admin/foodDashBoard"
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                View Foods
                            </NuxtLink>
                        </template>
                    </DashboardCard>

                    <!-- Order Management -->
                    <DashboardCard title="Order Management" description="Manage customer orders">
                        <template #icon>
                            <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </template>
                        <template #actions>
                            <NuxtLink to="/admin/orderDashBoard"
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                View Orders
                            </NuxtLink>
                        </template>
                    </DashboardCard>

                    <!-- User Management -->
                    <DashboardCard title="User Management" description="Manage users">
                        <template #icon>
                            <UIcon name="heroicons:users" class="h-8 w-8 text-gray-400" />
                        </template>
                        <template #actions>
                            <NuxtLink v-if="isAdmin" to="/admin/userDashBoard"
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                View Users
                            </NuxtLink>
                            <UAlert v-else :title="$t('alert.permission-denied')" color="neutral" variant="subtle" />
                        </template>
                    </DashboardCard>

                    <!-- Statistics -->
                    <DashboardCard title="Statistics" description="View analytics">
                        <template #icon>
                            <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </template>
                        <template #actions>
                            <button
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                Coming Soon
                            </button>
                        </template>
                    </DashboardCard>
                </div>
            </div>
        </main>
    </div>
</template>
<script setup lang="ts">
import PageHeader from '~/components/admin/AdminHeader.vue'
import DashboardCard from '~/components/admin/DashboardCard.vue'
import { useAuth } from '~/composables/useAuth';
const { isAdmin, isOperator } = useAuth();
</script>