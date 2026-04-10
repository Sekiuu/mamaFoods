<template>
  <div class="rounded-3xl border border-gray-100 p-8 shadow-sm"
    :class="statusColor(order ? orderStatus : OrderStatus.Pending)">
    <!-- Header and Order Summary -->
    <div class="mb-8 grid gap-6 lg:grid-cols-2">
      <div class="space-y-3">
        <p class="text-sm text-gray-500">
          {{ $t("orderCard.orderId") }} #{{ order.value.id }}
        </p>
        <h2 class="text-3xl font-bold text-gray-900 mt-2">
          {{ $t("orderCard.orderSummary") }}
        </h2>
        <p>{{ $t("order.status.title") }}:
          <OrderStatusTag :status="orderStatus" class="w-fit inline-block" />
        </p>
      </div>
      <div class="space-y-3 text-right">
        <p class="text-sm text-gray-500">
          {{ $t("orderCard.orderDate") }}
        </p>
        <p class="text-lg font-semibold text-gray-900">{{ formattedDate }}</p>
        <p class="text-sm text-gray-500">
          {{ $t("customerInfo.phone") }}
        </p>
        <p class="text-base text-gray-700">{{ order.value.customer_phone }}</p>
      </div>
    </div>
    <!-- Order Items -->
    <div class="space-y-4">
      <div v-for="item in orderItems" :key="item.id" class="rounded-3xl bg-gray-50/50 p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-semibold text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">฿{{ item.price * item.quantity }}</p>
            <p class="text-sm text-gray-500">{{ item.quantity }} x ฿{{ item.price }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Order Total and Address -->
    <div class="mt-6 border-t border-gray-200 pt-6">
      <div class="flex items-center justify-between">
        <span class="text-lg font-semibold text-gray-900">
          {{ $t("shop.cart.total") }}
        </span>
        <span class="text-2xl font-bold text-orange-600">฿{{ order.value.total_price }}</span>
      </div>
      <p class="text-sm text-gray-500 mt-1">
        {{ $t("customerInfo.address") }} : {{ order.value.customer_address }}</p>
      <p class="text-sm text-gray-500">
        {{ $t("customerInfo.note") }} : {{ order.value.customer_note || 'None' }}</p>
    </div>

    <!-- Payment QR Code -->
    <div v-if="orderStatus === OrderStatus.Pending" class="mt-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ $t("payment.qrCode.title") }}
      </h3>
      <div v-if="qrDataUrl" class="rounded-3xl bg-gray-50/25 p-6 text-center">
        <img :src="qrDataUrl" alt="PromptPay QR Code" class="mx-auto h-64 w-64" />
        <p class="mt-4 text-sm text-gray-500">
          {{ $t("payment.qrCode.desc") }}
        </p>
      </div>
      <div v-else class="rounded-3xl bg-gray-50 p-6 text-center text-gray-500">
        {{ $t("payment.qrCode.loading") }}
      </div>
    </div>

    <!-- Success State: Rating & Review -->
    <div v-if="orderStatus === OrderStatus.Completed" class="mt-8">
      <div class="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <div
          class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 text-2xl font-bold">
          ✓
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">
          {{ $t("orderCard.completed") }}
        </h3>
        <p class="text-sm text-gray-500 mb-4">{{ $t("orderCard.ratingAndReviewDesc") }}</p>
        <!-- Rating and Review Button (coming soon) -->
        <button v-if="false"
          class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
          <span>⭐</span>
          {{ $t("orderCard.ratingAndReview") }}
        </button>
      </div>
    </div>

    <!-- Cancel Order Button -->
    <div v-if="cancelable" class="mt-8">
      <button @click="onCancleOrder"
        class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl transition-colors">
        {{ $t("orderCard.cancelOrder") }}
      </button>
    </div>

    <!-- Confirmation Modal -->
    <UContainer v-if="showConfirmBlock" class="mt-8 bg-amber-500/20 rounded-3xl">
      <div class="p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ $t("order.status.delivered") }}</h3>
        <p class="text-gray-500 mb-6">{{ $t("orderCard.confirmReceiptDesc") }}</p>
        <UButton color="info" block class="flex-1 py-3" :loading="isConfirming" @click="onConfirmOrder">
          {{ $t("orderCard.confirmReceipt") }}
        </UButton>
      </div>
    </UContainer>

  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import type { Order, CartItem } from '~/types'
import { OrderStatus } from '~/types/orders'
import { useRouter } from 'vue-router'
import { V } from 'vue-router/dist/index-BzEKChPW.js'
const { locale: currentLocale } = useI18n()
const router = useRouter()


const props = defineProps<{
  order: Ref<Order>
  cancelable: boolean
}>()
const qrDataUrl = ref('')
const isConfirming = ref(false)
const showConfirmModal = ref(false)
const orderStatus = computed(() => props.order.value.status)

const showConfirmBlock = computed(() => {
  return orderStatus.value === OrderStatus.Delivered && !isConfirming.value
})
const orderItems = computed<CartItem[]>(() => {
  if (!props.order.value.items) {
    return []
  }
  try {
    return JSON.parse(props.order.value.items)
  } catch {
    return []
  }
})
const statusColor = (status: string) => {
  if (status === OrderStatus.Pending) return 'bg-orange-100'
  if (status === 'delivered') return 'bg-green-100'
  if (status === OrderStatus.Cancelled) return 'bg-red-200'
  return 'bg-blue-100'
}
const formattedDate = computed(() => {
  if (!props.order.value.create_at) return 'Unknown'
  const date = new Date(props.order.value.create_at)
  return date.toLocaleString(currentLocale.value, { dateStyle: 'medium', timeStyle: 'short' })
})

const cancelable = computed(() => {
  return props.cancelable && props.order.value.status === OrderStatus.Pending;
})

const onCancleOrder = async () => {
  if (!props.order.value.id || !props.order) return
  try {
    const payload = {
      ...props.order,
      status: OrderStatus.Cancelled,
    }
    const order = await $fetch(`/api/orders/${props.order.value.id}`, {
      method: 'PUT',
      body: payload,
    })
    alert('Order cancelled successfully.')
  } catch (error) {
    console.error('Failed to cancel order:', error)
    alert('Failed to cancel order. Please try again.')
  }
  finally {
    router.push('/myOrder')
  }
}

const onConfirmOrder = async () => {
  if (!props.order.value.id || !props.order) return
  isConfirming.value = true
  try {
    const { id, ...orderData } = props.order.value;
    const payload = {
      ...orderData,
      status: OrderStatus.Completed,
    }
    // console.log(payload)
    await $fetch(`/api/orders/${props.order.value.id}`, {
      method: 'PUT',
      body: payload,
    })
    // showConfirmModal.value = false
    router.go(0) // รีเฟรชหน้าเพื่ออัปเดตสถานะล่าสุด
  } catch (error) {
    console.error('Failed to confirm order:', error)
  } finally {
    isConfirming.value = false
  }
}

const generateQr = async () => {
  const phone = process.env.PROMPTPAY_PHONE || '0929853209';
  try {
    const promptpayModule = await import('promptpay-qr')
    const generatePayload = promptpayModule.default || promptpayModule
    const payload = generatePayload(phone, {
      amount: Number(props.order.value.total_price) || 0,
    })
    qrDataUrl.value = await QRCode.toDataURL(payload)
  } catch (error) {
    console.error('Failed to generate PromptPay QR:', error)
  }
}

onMounted(() => {
  if (orderStatus.value === OrderStatus.Pending) generateQr
})
watch(orderStatus, (newValue: string) => {
  console.log(newValue)
  if (newValue === OrderStatus.Delivered) {
    useToast().add({
      title: $t('order.status.delivered'),
      description: `${$t('order.status.delivered')} ${$t('orderCard.confirmReceiptDesc')}`,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  }
  if (newValue === OrderStatus.Completed) {
    useToast().add({
      title: `${$t('order.title}')}${$t('order.status.completed}')}`,
      description: $t('orderCard.completetOrderThnakyou'),
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  }
  if (orderStatus.value === OrderStatus.Pending) generateQr()
})

</script>

<style scoped>
img {
  max-width: 100%;
}
</style>