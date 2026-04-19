<template>
    <UCard>
        <template #header class="space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Food Items</h2>
                <UInput v-model="globalFilter" icon="i-lucide-search" placeholder="Search food items..." class="w-64" />
            </div>
        </template>

        <UTable :data="foods" :columns="columns" v-model:global-filter="globalFilter">
            <template #icon-cell="{ getValue }">
                <span class="truncate max-w-48 block text-sm text-muted">{{ getValue() }}</span>
            </template>

            <template #actions-cell="{ row }">
                <div class="flex items-center gap-2">
                    <UButton size="sm" color="info" @click="$emit('edit', row.original)">
                        Edit
                    </UButton>
                    <UButton size="sm" color="error" @click="$emit('delete', row.original.id)">
                        Delete
                    </UButton>
                </div>
            </template>
        </UTable>
    </UCard>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { FoodItem } from '../../types'

defineProps<{
    foods: FoodItem[]
}>()

defineEmits<{
    edit: [food: FoodItem]
    delete: [id: number]
}>()

const globalFilter = ref('')

const columns: TableColumn<FoodItem>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'show', header: 'Is Showing' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'icon', header: 'Icon' },
    {
        id: 'actions',
        header: 'Actions',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    }
]
</script>
