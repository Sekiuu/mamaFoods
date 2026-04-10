<template>
  <UCard>
    <template #header>
      <UContainer class="flex justify-between">
        <h1 class="text-3xl"> Users</h1>
        <UInput v-model="globalFilter" color="info" variant="soft" icon="i-lucide-search" placeholder="Search users..."
          class="w-64 my-auto" />
      </UContainer>
    </template>

    <UTable :data="users" :columns="columns" v-model:global-filter="globalFilter">
      <!-- Format the Created date -->
      <template #create_at-cell="{ getValue }">
        {{ formatDate(getValue() as UserItem['create_at']) }}
      </template>

      <!-- Edit & Delete actions -->
      <template #actions-cell="{ row: thisRow }">
        <div class="flex items-center gap-2">
          <UButton size="sm" color="info" @click="$emit('edit', thisRow.original)">
            Edit
          </UButton>
          <UButton size="sm" color="error" @click="$emit('delete', thisRow.original.id)">
            Delete
          </UButton>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { UserItem } from '../../types'

defineProps<{
  users: UserItem[]
}>()

defineEmits<{
  edit: [user: UserItem]
  delete: [id: number]
}>()

const globalFilter = ref('')

const columns: TableColumn<UserItem>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'create_at', header: 'Created' },
  {
    id: 'actions',
    header: 'Actions',
    meta: { class: { th: 'text-center', td: 'text-center' } }
  }
]

const formatDate = (value: UserItem['create_at']) => {
  if (!value) return '-'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}
</script>
