<template>
  <div class="rounded-3xl border border-gray-100 p-8 shadow-sm" :class="statusColor(order? order.status : OrderStatus.Pending)">
    <!-- Header and Order Summary -->
    <div class="mb-8 grid gap-6 lg:grid-cols-2">
      <div class="space-y-3">
        <p class="text-sm text-gray-500">
          {{ $t("orderCard.orderId") }} #{{ order.id }}
        </p>
        <h2 class="text-3xl font-bold text-gray-900 mt-2">
          {{ $t("orderCard.orderSummary") }}
        </h2>
        <p>{{ $t("order.status.title") }}: <OrderStatusTag :status="order.status" class="w-fit inline-block"/></p>
      </div>
      <div class="space-y-3 text-right">
        <p class="text-sm text-gray-500">
          {{ $t("orderCard.orderDate") }}
        </p>
        <p class="text-lg font-semibold text-gray-900">{{ formattedDate }}</p>
        <p class="text-sm text-gray-500">
          {{ $t("customerInfo.phone") }}
        </p>
        <p class="text-base text-gray-700">{{ order.customer_phone }}</p>
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
        <span class="text-2xl font-bold text-orange-600">฿{{ order.total_price }}</span>
      </div>
      <p class="text-sm text-gray-500 mt-1">
        {{ $t("customerInfo.address") }} : {{ order.customer_address }}</p>
      <p class="text-sm text-gray-500">
        {{ $t("customerInfo.note") }} : {{ order.customer_note || 'None' }}</p>
    </div>
    <!-- Payment QR Code -->
    <div v-if="order.status === OrderStatus.Pending" class="mt-8">
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
    <!-- Cancel Order Button -->
    <div v-if="cancelable" class="mt-8">
      <button @click="onCancleOrder"
        class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl transition-colors">
        {{ $t("orderCard.cancelOrder") }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import type { Order, CartItem } from '~/types'
import { OrderStatus } from '~/types/orders'
import { useRouter } from 'vue-router'
const { locales, locale: currentLocale, setLocale } = useI18n()
const router = useRouter()


const props = defineProps<{
  order: Order
  cancelable: boolean
}>()
const qrDataUrl = ref('')

const orderItems = computed<CartItem[]>(() => {
  if (!props.order.items) {
    return []
  }
  try {
    return JSON.parse(props.order.items)
  } catch {
    return []
  }
})
const statusColor = (status: string) => {
    if(status === OrderStatus.Pending) return 'bg-orange-100'
    if(status === OrderStatus.Cancelled) return 'bg-red-200'
    return 'bg-green-100'
}
const formattedDate = computed(() => {
  if (!props.order.create_at) return 'Unknown'
  const date = new Date(props.order.create_at)
  return date.toLocaleString(currentLocale.value, { dateStyle: 'medium', timeStyle: 'short'})
})

const cancelable = computed(() => {
  return props.cancelable && props.order.status === OrderStatus.Pending;
})

const onCancleOrder = async () => {
  if (!props.order.id || !props.order) return
  try {
    const payload = {
      ...props.order,
      status: OrderStatus.Cancelled,
    }
    const order = await $fetch(`/api/orders/${props.order.id}`, {
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

const generateQr = async () => {
  const phone = process.env.PROMPTPAY_PHONE || '0929853209';
  try {
    const promptpayModule = await import('promptpay-qr')
    const generatePayload = promptpayModule.default || promptpayModule
    const payload = generatePayload(phone, {
      amount: Number(props.order.total_price) || 0,
    })
    qrDataUrl.value = await QRCode.toDataURL(payload)
  } catch (error) {
    console.error('Failed to generate PromptPay QR:', error)
  }
}

onMounted(() => { if (props.order.status === OrderStatus.Pending) generateQr })
watch(() => props.order, generateQr)

</script>

<style scoped>
img {
  max-width: 100%;
}
</style>