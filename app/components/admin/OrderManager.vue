<script setup lang="ts">
import { OrderStatus, type Order } from '~/types/orders'
import { useOrderManagement } from '~/composables/useOrderManagement'
import { PaymentStatus } from '~/types/orders'

interface Props {
    orders: Order[]
    onStatusUpdate: (id: number, status: string) => void
    detailLink?: string
}
const props = defineProps<Props>()
const { formatDate } = useOrderManagement()
const { t } = useI18n()
if (!props.detailLink?.endsWith('/')){
    console.error('detailLink should end with /')
}


const updatingOrder = ref({ id: -1, isUpdating: false })

// Per-order modal state — keyed by order id
const forceCompleteOpenMap = ref<Record<number, boolean>>({})

const openForceComplete = (id: number) => forceCompleteOpenMap.value[id] = true
const closeForceComplete = (id: number) => forceCompleteOpenMap.value[id] = false

const handleStatusUpdate = async (id: number, status: string) => {
    updatingOrder.value = { id, isUpdating: true }
    try {
        await props.onStatusUpdate(id, status)
    } catch (err) {
        console.error(err)
    } finally {
        updatingOrder.value = { id: -1, isUpdating: false }
    }
}

// Status badge config
const statusConfig: Record<string, { color: 'warning' | 'info' | 'success' | 'error' | 'neutral', icon: string }> = {
    [OrderStatus.Pending]: { color: 'warning', icon: 'i-lucide-clock' },
    [OrderStatus.Confirmed]: { color: 'info', icon: 'i-lucide-check' },
    [OrderStatus.Preparing]: { color: 'info', icon: 'i-lucide-chef-hat' },
    [OrderStatus.Delivering]: { color: 'info', icon: 'i-lucide-bike' },
    [OrderStatus.Delivered]: { color: 'success', icon: 'i-lucide-package-check' },
    [OrderStatus.Completed]: { color: 'success', icon: 'i-lucide-check-circle' },
    [OrderStatus.Cancelled]: { color: 'error', icon: 'i-lucide-x-circle' },
}

const getStatus = (status: string) =>
    statusConfig[status] ?? { color: 'neutral' as const, icon: 'i-lucide-circle' }

// Action buttons per status
const getActions = (status: string, isPaid: boolean = false) => [
    {
        show: status === OrderStatus.Pending,
        label: t('orderActions.confirm'),
        icon: 'i-lucide-check',
        color: 'success' as const,
        next: OrderStatus.Confirmed,
    },
    {
        show: status === OrderStatus.Pending || status === OrderStatus.Confirmed,
        label: t('orderActions.cancel'),
        icon: 'i-lucide-x',
        color: 'error' as const,
        next: OrderStatus.Cancelled,
    },
    {
        show: status === OrderStatus.Confirmed,
        label: t('orderActions.startPreparing'),
        icon: 'i-lucide-chef-hat',
        color: 'info' as const,
        next: OrderStatus.Preparing,
    },
    {
        show: status === OrderStatus.Preparing,
        label: t('orderActions.startDelivery'),
        icon: 'i-lucide-bike',
        color: 'info' as const,
        next: OrderStatus.Delivering,
    },
    {
        show: status === OrderStatus.Delivering,
        label: t('orderActions.markDelivered'),
        icon: 'i-lucide-package-check',
        color: 'success' as const,
        next: OrderStatus.Delivered,
    },
    {
        show: !isPaid,
        label: t('orderActions.markPaid'),
        icon: 'i-lucide-circle-dollar-sign',
        color: 'success' as const,
        next: PaymentStatus.Paid,
    }
].filter(a => a.show)
</script>

<template>
    <UCard class="space-y-3">
        <template #header>
            <UContainer class="flex justify-between">
                <h1 class="text-3xl"> {{ $t('order.title') }} </h1>
            </UContainer>
        </template>
        <UCard v-for="order in orders" :key="order.id" variant="outline">

            <!-- Header: Order ID + Status -->
            <template #header>
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-2">
                        <p class="font-semibold">{{ $t('orderCard.orderId') }} #{{ order.id }}</p>
                        <UBadge :color="getStatus(order.status).color" :icon="getStatus(order.status).icon"
                            :label="order.status" variant="subtle" size="sm" />
                    </div>
                    <p class="text-sm text-muted">{{ formatDate(order.create_at) }}</p>
                </div>
            </template>

            <!-- Body: Customer info -->
            <div class="grid sm:grid-cols-2 gap-1 text-sm text-muted">
                <p class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-user" class="size-4 shrink-0" />
                    {{ order.customer_name }}
                </p>
                <p class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
                    {{ order.customer_phone }}
                </p>
                <p class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
                    {{ order.customer_address }}
                </p>
                <p class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-banknote" class="size-4 shrink-0" />
                    ฿{{ order.total_price }}
                </p>
            </div>

            <!-- Footer: Action buttons -->
            <template #footer>
                <!-- Updating state -->
                <div v-if="updatingOrder.id === order.id && updatingOrder.isUpdating">
                    <UButton :label="`${$t('orderManager.changingStatus')}...`" color="neutral" variant="subtle" loading
                        disabled />
                </div>

                <!-- Action buttons -->
                <div v-else class="flex justify-between">
                    <!-- Regular status transitions -->
                    <div class="flex flex-wrap gap-2">
                        <UButton v-for="action in getActions(order.status, order.payment_status === PaymentStatus.Paid)"
                            :key="action.next" :label="action.label" :icon="action.icon" :color="action.color"
                            variant="subtle" size="sm" @click="handleStatusUpdate(order.id, action.next)" />
                        <!-- Force Complete Modal (Delivered status only) -->
                        <UModal
                            v-if="order.status === OrderStatus.Delivered && order.payment_status === PaymentStatus.Paid"
                            v-model:open="forceCompleteOpenMap[order.id]"
                            :title="`${$t('orderManager.forceComplete')} — ${$t('order.title')} #${order.id}`"
                            :description="$t('orderManager.forceCompleteConfirmation')">
                            <!-- Trigger -->
                            <UButton :label="$t('orderManager.forceComplete')" icon="i-lucide-shield-check"
                                color="warning" variant="subtle" size="sm" @click="openForceComplete(order.id)" />

                            <!-- Footer actions -->
                            <template #footer>
                                <div class="flex justify-end gap-2">
                                    <UButton :label="$t('btn.cancel')" color="neutral" variant="outline"
                                        @click="closeForceComplete(order.id)" />
                                    <UButton :label="$t('btn.confirm')" color="success" icon="i-lucide-check"
                                        @click="handleStatusUpdate(order.id, OrderStatus.Completed); closeForceComplete(order.id)" />
                                </div>
                            </template>
                        </UModal>
                    </div>
                    <!-- view details -->
                    <UButton v-if="detailLink" :to="`${detailLink}${order.id}`" color="primary" variant="solid"
                        trailing-icon="i-lucide-arrow-right">
                        {{ $t('orderList.viewDetails') }}
                    </UButton>
                </div>
            </template>

        </UCard>
    </UCard>
</template>
