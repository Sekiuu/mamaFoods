<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { OrderStatus, PaymentStatus, type Order } from '~/types/orders'
import { useOrderManagement } from '~/composables/useOrderManagement'

interface Props {
    orders: Order[]
    onStatusUpdate: (id: number, status: string) => void
    onEdit: (order: Order) => void
    onDelete: (id: number) => Promise<boolean>
}

const props = defineProps<Props>()
const { formatDate } = useOrderManagement()
const toast = useToast()
const { t } = useI18n()

// ── Edit modal ────────────────────────────────────────────────
const editOpen = ref(false)
const editingOrder = ref<Order | null>(null)
const isSaving = ref(false)
const isDeleting = ref<number | null>(null)

const handleEdit = (order: Order) => {
    editingOrder.value = { ...order }
    editOpen.value = true
    props.onEdit(order)
}

const closeEditModal = () => {
    editOpen.value = false
    editingOrder.value = null
}

const handleSaveEdit = async () => {
    if (!editingOrder.value) return
    isSaving.value = true
    try {
        await props.onStatusUpdate(editingOrder.value.id, editingOrder.value.status ?? OrderStatus.Pending)
        toast.add({ title: t('admin.toasts.orderUpdated'), color: 'success', icon: 'i-lucide-check-circle' })
        closeEditModal()
    } catch (error) {
        console.error('Failed to save order:', error)
        toast.add({ title: t('admin.toasts.orderUpdateFailed'), color: 'error', icon: 'i-lucide-x-circle' })
    } finally {
        isSaving.value = false
    }
}

const handleDelete = async (id: number) => {
    isDeleting.value = id
    try {
        await props.onDelete(id)
        toast.add({ title: t('admin.toasts.orderDeleted', { id }), color: 'success', icon: 'i-lucide-trash' })
    } finally {
        isDeleting.value = null
    }
}

// ── Status options ────────────────────────────────────────────
const orderStatusOptions = [
    { label: t('order.status.pending'), value: OrderStatus.Pending, icon: 'i-lucide-clock' },
    { label: t('order.status.confirmed'), value: OrderStatus.Confirmed, icon: 'i-lucide-check' },
    { label: t('order.status.preparing'), value: OrderStatus.Preparing, icon: 'i-lucide-chef-hat' },
    { label: t('order.status.delivering'), value: OrderStatus.Delivering, icon: 'i-lucide-bike' },
    { label: t('order.status.delivered'), value: OrderStatus.Delivered, icon: 'i-lucide-package-check' },
    { label: t('order.status.completed'), value: OrderStatus.Completed, icon: 'i-lucide-check-circle' },
    { label: t('order.status.cancelled'), value: OrderStatus.Cancelled, icon: 'i-lucide-x-circle' },
]

const paymentStatusOptions = [
    { label: t('payment.paid'), value: PaymentStatus.Paid, icon: 'i-lucide-circle-dollar-sign' },
    { label: t('payment.unpaid'), value: PaymentStatus.Unpaid, icon: 'i-lucide-ban' },
]

const statusConfig: Record<string, { color: 'warning' | 'info' | 'success' | 'error' | 'neutral', icon: string }> = {
    [OrderStatus.Pending]: { color: 'warning', icon: 'i-lucide-clock' },
    [OrderStatus.Confirmed]: { color: 'info', icon: 'i-lucide-check' },
    [OrderStatus.Preparing]: { color: 'info', icon: 'i-lucide-chef-hat' },
    [OrderStatus.Delivering]: { color: 'info', icon: 'i-lucide-bike' },
    [OrderStatus.Delivered]: { color: 'success', icon: 'i-lucide-package-check' },
    [OrderStatus.Completed]: { color: 'success', icon: 'i-lucide-check-circle' },
    [OrderStatus.Cancelled]: { color: 'error', icon: 'i-lucide-x-circle' },
}

const paymentConfig: Record<string, { color: 'success' | 'neutral', icon: string }> = {
    [PaymentStatus.Paid]: { color: 'success', icon: 'i-lucide-circle-dollar-sign' },
    [PaymentStatus.Unpaid]: { color: 'neutral', icon: 'i-lucide-ban' },
}

// ── Table columns ─────────────────────────────────────────────
const UBadge = resolveComponent('UBadge')
const USelectMenu = resolveComponent('USelectMenu')
const UButton = resolveComponent('UButton')

const columns: TableColumn<Order>[] = [
    {
        accessorKey: 'id',
        header: t('admin.table.id'),
        cell: ({ row }) => h('span', { class: 'font-semibold' }, `#${row.original.id}`),
    },
    {
        accessorKey: 'customer_name',
        header: t('admin.table.customer'),
    },
    {
        accessorKey: 'customer_phone',
        header: t('admin.table.phone'),
    },
    {
        accessorKey: 'customer_address',
        header: t('admin.table.address'),
        cell: ({ row }) =>
            h('span', { class: 'max-w-[160px] truncate block', title: row.original.customer_address ?? '' },
                row.original.customer_address?? '',
            ),
    },
    {
        accessorKey: 'total_price',
        header: t('admin.table.total'),
        cell: ({ row }) => h('span', { class: 'font-semibold' }, `฿${row.original.total_price}`),
    },
    {
        accessorKey: 'status',
        header: t('admin.table.status'),
        cell: ({ row }) =>
            h(USelectMenu, {
                modelValue: row.original.status,
                items: orderStatusOptions,
                valueKey: 'value',
                class: 'w-44',
                'onUpdate:modelValue': (val: string) => props.onStatusUpdate(row.original.id, val),
            }, {
                'leading': () => h(UBadge, {
                    color: statusConfig[row.original.status]?.color ?? 'neutral',
                    variant: 'subtle',
                    size: 'sm',
                    icon: statusConfig[row.original.status]?.icon,
                    class: 'mr-1',
                }),
            }),
    },
    {
        accessorKey: 'payment_status',
        header: t('admin.table.payment'),
        cell: ({ row }) =>
            h(USelectMenu, {
                modelValue: row.original.payment_status,
                items: paymentStatusOptions,
                valueKey: 'value',
                class: 'w-32',
                'onUpdate:modelValue': (val: string) => props.onStatusUpdate(row.original.id, val),
            }, {
                'leading': () => h(UBadge, {
                    color: paymentConfig[row.original.payment_status]?.color ?? 'neutral',
                    variant: 'subtle',
                    size: 'sm',
                    icon: paymentConfig[row.original.payment_status]?.icon,
                    class: 'mr-1',
                }),
            }),
    },
    {
        accessorKey: 'create_at',
        header: t('admin.table.created'),
        cell: ({ row }) => h('span', { class: 'text-muted text-sm' }, formatDate(row.original.create_at)),
    },
    {
        id: 'actions',
        header: t('admin.table.actions'),
        cell: ({ row }) =>
            h('div', { class: 'flex items-center gap-2' }, [
                h(UButton, {
                    icon: 'i-lucide-pencil',
                    size: 'sm',
                    color: 'info',
                    variant: 'ghost',
                    onClick: () => handleEdit(row.original),
                }),
                h(UButton, {
                    icon: 'i-lucide-trash',
                    size: 'sm',
                    color: 'error',
                    variant: 'ghost',
                    loading: isDeleting.value === row.original.id,
                    onClick: () => handleDelete(row.original.id),
                }),
            ]),
    },
]

defineExpose({ editingOrder })
</script>

<template>
    <UCard>
        <template #header>
            <p class="text-lg font-semibold">{{ $t('admin.crud.orderTitle') }}</p>
        </template>

        <!-- Table -->
        <UTable :data="orders" :columns="columns" sticky class="max-h-screen" />

        <!-- Edit Modal -->
        <UModal v-model:open="editOpen" :title="$t('admin.crud.editOrder', { id: editingOrder?.id })"
            :description="$t('admin.crud.editOrderDesc')" @update:open="val => !val && closeEditModal()">
            <template #body>
                <div v-if="editingOrder" class="space-y-4">
                    <UFormField :label="$t('customerInfo.name')" name="customer_name">
                        <UInput v-model="editingOrder.customer_name" :placeholder="$t('customerInfo.name')"
                            leading-icon="i-lucide-user" class="w-full" />
                    </UFormField>

                    <UFormField :label="$t('customerInfo.phone')" name="customer_phone">
                        <UInput v-model="editingOrder.customer_phone" :placeholder="$t('customerInfo.phone')"
                            leading-icon="i-lucide-phone" class="w-full" />
                    </UFormField>

                    <UFormField :label="$t('customerInfo.address')" name="customer_address">
                        <UTextarea v-model="editingOrder.customer_address" :placeholder="$t('customerInfo.address')" :rows="3"
                            class="w-full" />
                    </UFormField>

                    <UFormField :label="$t('customerInfo.note')" name="customer_note">
                        <UTextarea v-model="editingOrder.customer_note" :placeholder="$t('customerInfo.note')" :rows="2"
                            class="w-full" />
                    </UFormField>

                    <USeparator />

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField :label="$t('admin.table.status')" name="status">
                            <USelectMenu v-model="editingOrder.status" :items="orderStatusOptions" value-key="value"
                                leading-icon="i-lucide-package" class="w-full" />
                        </UFormField>

                        <UFormField :label="$t('admin.table.payment')" name="payment_status">
                            <USelectMenu v-model="editingOrder.payment_status" :items="paymentStatusOptions"
                                value-key="value" leading-icon="i-lucide-credit-card" class="w-full" />
                        </UFormField>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton :label="$t('btn.cancel')" color="neutral" variant="outline" icon="i-lucide-x"
                        @click="closeEditModal" />
                    <UButton :label="$t('btn.save')" color="primary" icon="i-lucide-save" :loading="isSaving"
                        @click="handleSaveEdit" />
                </div>
            </template>
        </UModal>
    </UCard>
</template>
