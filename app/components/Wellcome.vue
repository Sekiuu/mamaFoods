<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <div class="max-w-5xl mx-auto px-6 py-12">
      
      <header class="relative overflow-hidden rounded-3xl bg-orange-500 px-8 py-16 text-center text-white shadow-2xl mb-12">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg class="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
            <circle cx="10" cy="10" r="2" />
            <circle cx="90" cy="90" r="2" />
            <circle cx="50" cy="50" r="20" variant="outline" stroke="white" />
          </svg>
        </div>

        <h1 class="relative z-10 text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Welcome to <span class="text-yellow-300">MamaFood</span>
        </h1>
        <p class="relative z-10 text-lg md:text-xl font-medium text-orange-100 max-w-2xl mx-auto">
          Your favorite place for delicious meals, prepared with love and delivered with speed.
        </p>
      </header>

      <section class="mb-20">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-800">Our Features</h2>
          <div class="h-1 w-20 bg-orange-500 mx-auto mt-2 rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 updateGridCols">
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🥗
            </div>
            <h3 class="font-bold text-xl mb-2">Fresh Ingredients</h3>
            <p class="text-gray-600">Sourced daily from local farmers to ensure the best quality.</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🚀
            </div>
            <h3 class="font-bold text-xl mb-2">Fast Delivery</h3>
            <p class="text-gray-600">Hot and fresh food delivered to your door in under 30 mins.</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📱
            </div>
            <h3 class="font-bold text-xl mb-2">Easy Ordering</h3>
            <p class="text-gray-600">A seamless experience from browsing to checkout.</p>
          </div>
        </div>
      </section>
      
      <!-- Call to Action Section-->
      <div class="bg-gray-900 rounded-3xl p-10 md:p-16 text-center text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to eat?</h2>
          <p class="text-gray-400 mb-8 max-w-lg mx-auto">
            Order now and enjoy a delicious meal delivered to your doorstep!
          </p>
          <button class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg"
            @click="orderNow"
          >
            Order Now
          </button>
        </div>
        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

// เรียกใช้งาน router instance
const router = useRouter()

const orderNow = () => {
  // ใช้ .push() บน router เพื่อย้ายไปยังหน้า /order
  router.push('/shop')
}
</script>