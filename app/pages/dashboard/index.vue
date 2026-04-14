<script setup lang="ts">
import AdminHeader from '~/components/admin/AdminHeader.vue'
import { useUserAuth } from '~/composables/useUserAuth';
const { isAdmin, isOperator } = useUserAuth();
</script>
<template>
    <UPage class="min-h-screen">
        <AdminHeader :title="$t('admin.header.dashboard')" :enable-logout="true"/>

        <UPageBody class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Food Management -->
                    <UPageCard :title="$t('shop.management.food')" :description="$t('shop.management.foodDesc')" icon="material-symbols:fastfood">
                        <template #default>
                            <NuxtLink to="/dashboard/foodDashBoard"
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                {{ $t('btn.view') }}
                            </NuxtLink>
                        </template>
                    </UPageCard>

                    <!-- Order Management -->
                    <UPageCard :title="$t('shop.management.order')" :description="$t('shop.management.orderDesc')" icon="mdi:receipt-text-edit">
                        <template #default>
                            <NuxtLink to="/dashboard/orderDashBoard"
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                {{ $t('btn.view') }}
                            </NuxtLink>
                        </template>
                    </UPageCard>

                    <!-- User Management -->
                    <UPageCard :title="$t('shop.management.user')" :description="$t('shop.management.userDesc')" icon="fa7-solid:users">
                        <template #default>
                            <NuxtLink v-if="isAdmin" to="/dashboard/userDashBoard"
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                {{ $t('btn.view') }}
                            </NuxtLink>
                            <UAlert v-else :title="$t('alert.permission-denied')" color="neutral" variant="subtle" />
                        </template>
                    </UPageCard>

                    <!-- Statistics -->
                    <UPageCard :title="$t('shop.management.stats')" :description="$t('shop.management.statsDesc')" icon="material-symbols:bar-chart-4-bars">
                        <template #default>
                            <button
                                class="ml-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                                ...
                            </button>
                        </template>
                    </UPageCard>
        </UPageBody>
    </UPage>
</template>
