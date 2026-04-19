<script setup lang="ts">
import QRCode from 'qrcode'
import type { Order, CartItem } from '~/types'
import { OrderStatus, PaymentStatus } from '~/types/orders'
import generatePayload from 'promptpay-qr'

const { locale: currentLocale, t: $t } = useI18n()
const toast = useToast()
const config = useRuntimeConfig()

const props = defineProps<{
  order: Ref<Order>
  cancelable: boolean
  editable?: boolean
}>()

const isEditingMode = ref(false)
const editForm = ref<Partial<Order>>({})
const isSaving = ref(false)

const qrDataUrl = ref('')
const isConfirming = ref(false)
const isGeneratingQR = ref(false)

const startEditing = () => {
  editForm.value = { ...props.order.value }
  isEditingMode.value = true
}

const cancelEditing = () => {
  isEditingMode.value = false
  editForm.value = {}
}

const saveChanges = async () => {
  if (!props.order.value.id) return
  isSaving.value = true
  try {
    const data = await $fetch(`/api/orders/${props.order.value.id}`, {
      method: 'PUT',
      body: editForm.value,
    })
    props.order.value = data as Order
    isEditingMode.value = false
    toast.add({ title: $t('admin.toasts.orderUpdated'), color: 'success', icon: 'i-lucide-check-circle' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Failed to update order', color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    isSaving.value = false
  }
}

const orderStatus = computed(() => props.order.value.status)
const paymentStatus = computed(() => props.order.value.payment_status)
const showConfirmBlock = computed(() =>
  orderStatus.value === OrderStatus.Delivered && !isConfirming.value
)

const orderItems = computed<CartItem[]>(() => {
  if (!props.order.value.items) return []
  try {
    return JSON.parse(props.order.value.items)
  } catch {
    return []
  }
})

const formattedDate = computed(() => {
  if (!props.order.value.create_at) return 'Unknown'
  return new Date(props.order.value.create_at).toLocaleString(currentLocale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

const cancelable = computed(() =>
  props.cancelable && props.order.value.status === OrderStatus.Pending
)

const statusConfig = useStatusConfig()
const currentStatus = computed(() =>
  statusConfig[orderStatus.value]
)

// Actions
const onCancelOrder = async () => {
  if (!props.order.value.id) return
  try {
    await $fetch(`/api/orders/${props.order.value.id}`, {
      method: 'PUT',
      body: { ...props.order.value, status: OrderStatus.Cancelled },
    })
    toast.add({ title: $t('orderCard.cancelOrder'), color: 'success', icon: 'i-lucide-check-circle' })
    navigateTo('/myOrders')
  } catch {
    toast.add({ title: 'Failed to cancel order', color: 'error', icon: 'i-lucide-x-circle' })
  }
}

const onConfirmOrder = async () => {
  if (!props.order.value.id) return
  isConfirming.value = true
  try {
    const { id, ...orderData } = props.order.value
    await $fetch(`/api/orders/${id}`, {
      method: 'PUT',
      body: { ...orderData, status: OrderStatus.Completed },
    })
  } catch {
    toast.add({ title: 'Failed to confirm order', color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    isConfirming.value = false
  }
}

const generateQr = async () => {
  if (qrDataUrl.value.length > 0) {
    console.log('QR code already generated')
    return
  }

  const phone = config.public.promptpayPhone ?? undefined
  if (!phone) {
    console.error('PromptPay phone is not configured in public runtimeConfig')
    return
  }
  try {
    isGeneratingQR.value = true
    const payload = generatePayload(phone as string, { amount: Number(props.order.value.total_price) || 0 })
    qrDataUrl.value = await QRCode.toDataURL(payload)
  } catch (error) {
    console.error('Failed to generate PromptPay QR:', error)
  } finally {
    isGeneratingQR.value = false
  }
}

onMounted(async () => {
  if (paymentStatus.value !== PaymentStatus.Paid) await generateQr()
})

watch(orderStatus, (newValue) => {
  const orderStatus = newValue

  if (orderStatus === OrderStatus.Delivered) {
    toast.add({
      title: $t('order.status.delivered'),
      description: `${$t('order.status.delivered')} ${$t('orderCard.confirmReceiptDesc')}`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  }
  if (orderStatus === OrderStatus.Completed) {
    toast.add({
      title: `${$t('order.title')} ${$t('order.status.completed')}`,
      description: $t('orderCard.completetOrderThnakyou'),
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  }
})
</script>

<template>
  <UCard :color="currentStatus?.color" variant="soft">

    <!-- ── Header: Order ID + Date ── -->
    <template #header>
      <UButton v-if="!isEditingMode && editable" color="primary" variant="solid" icon="i-lucide-edit" 
      @click="isEditingMode = true" class="mb-4">
        {{ $t('btn.edit') }}
      </UButton>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div class="flex-1">
          <p class="text-sm text-muted">{{ $t('orderCard.orderId') }} #{{ order.value.id }}</p>
          <div v-if="isEditingMode" class="mt-2">
            <UFormField :label="$t('customerInfo.name')">
              <UInput v-model="editForm.customer_name" icon="i-lucide-user" />
            </UFormField>
          </div>
          <p v-else class="text-2xl font-bold">
            {{ order.value.customer_name || $t('orderCard.orderSummary') }}
          </p>
        </div>
        <div class="sm:text-right space-y-1">
          <p class="text-sm text-muted">{{ $t('orderCard.orderDate') }}</p>
          <p class="font-semibold">{{ formattedDate }}</p>
          <p class="text-sm text-muted">{{ $t('customerInfo.phone') }}</p>
          <UInput v-if="isEditingMode" v-model="editForm.customer_phone" icon="i-lucide-phone" size="sm" />
          <p v-else>{{ order.value.customer_phone }}</p>

          <UButton v-if="editable && !isEditingMode && orderStatus === OrderStatus.Pending" 
            variant="ghost" color="neutral" icon="i-lucide-pencil" size="xs" class="mt-1" @click="startEditing">
            {{ $t('btn.edit') }}
          </UButton>
        </div>
      </div>

      <!-- Status badge -->
      <div class="mt-3 flex items-center gap-2">
        <span class="text-sm text-muted">{{ $t('order.status.title') }}:</span>
        <OrderStatusTag :status="orderStatus" />
      </div>
    </template>

    <!-- ── Body: Order Items ── -->
    <div class="space-y-3">
      <UCard v-for="item in orderItems" :key="item.id" variant="subtle">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-semibold">{{ item.name }}</p>
            <p class="text-sm text-muted">{{ item.description }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-semibold">฿{{ item.price * item.quantity }}</p>
            <p class="text-sm text-muted">{{ item.quantity }} × ฿{{ item.price }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- ── Footer: Total, Address, Actions ── -->
    <template #footer>
      <!-- Total -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-lg font-semibold">{{ $t('shop.cart.total') }}</span>
        <span class="text-2xl font-bold text-primary">฿{{ order.value.total_price }}</span>
      </div>

      <!-- Address & Note -->
      <div class="space-y-1 text-sm text-muted mb-4">
        <div v-if="isEditingMode" class="space-y-2">
          <UFormField :label="$t('customerInfo.address')">
            <UTextarea v-model="editForm.customer_address" :rows="3" />
          </UFormField>
          <UFormField :label="$t('customerInfo.note')">
            <UTextarea v-model="editForm.customer_note" :rows="2" />
          </UFormField>
        </div>
        <template v-else>
          <p>
          <UIcon name="i-lucide-map-pin" class="inline size-4 mr-1" />
          {{ $t('customerInfo.address') }}: {{ order.value.customer_address }}
        </p>
        <p>
          <UIcon name="i-lucide-notebook-pen" class="inline size-4 mr-1" />
          {{ $t('customerInfo.note') }}: {{ order.value.customer_note || 'None' }}
        </p>
        </template>
      </div>

      <USeparator class="mb-4" />

      <!-- Edit Actions -->
      <div v-if="isEditingMode" class="flex gap-2 mb-4">
        <UButton color="primary" icon="i-lucide-save" :loading="isSaving" @click="saveChanges">
          {{ $t('btn.save') }}
        </UButton>
        <UButton color="neutral" variant="outline" icon="i-lucide-x" @click="cancelEditing">
          {{ $t('btn.cancel') }}
        </UButton>
      </div>

      <!-- Payment QR Code -->
      <div v-if="paymentStatus !== PaymentStatus.Paid" class="mb-4">
        <p class="text-lg font-semibold mb-3">{{ $t('payment.qrCode.title') }}</p>
        <UCard variant="subtle" class="text-center" v-if="!isGeneratingQR">
          <img :src="qrDataUrl" alt="PromptPay QR Code" class="mx-auto h-64 w-64" />
          <p class="mt-3 text-sm text-muted">{{ $t('payment.qrCode.desc') }}</p>
        </UCard>
        <UCard variant="subtle" class="text-center text-muted" v-else>
          <div class="flex items-center justify-center gap-2 py-4">
            <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
            {{ $t('payment.qrCode.loading') }}...
          </div>
        </UCard>
      </div>

      <!-- Completed state -->
      <UAlert v-if="orderStatus === OrderStatus.Completed" color="success" variant="subtle" icon="i-lucide-check-circle"
        :title="$t('orderCard.completed')" :description="$t('orderCard.ratingAndReviewDesc')" class="mb-4" />

      <!-- Delivery confirmation -->
      <UAlert v-if="showConfirmBlock" color="warning" variant="subtle" icon="i-lucide-package-check"
        :title="$t('order.status.delivered')" :description="$t('orderCard.confirmReceiptDesc')" orientation="horizontal"
        :actions="[{
          label: $t('orderCard.confirmReceipt'),
          color: 'success',
          loading: isConfirming,
          onClick: onConfirmOrder,
        }]" class="mb-4" />

      <!-- Cancel button -->
      <UButton v-if="cancelable" color="error" variant="solid" block icon="i-lucide-x" @click="onCancelOrder">
        {{ $t('orderCard.cancelOrder') }}
      </UButton>
    </template>

  </UCard>
</template>
