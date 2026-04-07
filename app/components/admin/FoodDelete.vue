<template>
  <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm">
      <h2 class="text-xl font-bold text-red-600 mb-4">Delete Food Item</h2>
      
      <p class="text-gray-700 mb-6">
        Are you sure you want to delete <strong>{{ foodName }}</strong>? This action cannot be undone.
      </p>

      <div class="flex gap-4 justify-end">
        <button
          @click="cancelDelete"
          class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          :disabled="isDeleting"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
        >
          {{ isDeleting ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Food {
  id: number;
  name?: string | null;
  price?: string | null;
  description?: string | null;
  icon?: string | null;
  last_edit?: Date | null;
}

const props = defineProps<{
  food: Food | null;
}>();

const emit = defineEmits<{
  "food-deleted": [];
  close: [];
}>();

const isDeleting = ref(false);
const showDialog = computed(() => props.food !== null);
const foodName = computed(() => props.food?.name || "Unknown");

const cancelDelete = () => {
  emit("close");
};

const confirmDelete = async () => {
  if (!props.food?.id) return;

  isDeleting.value = true;
  try {
    await $fetch(`/api/foods/${props.food.id}`, {
      method: "DELETE",
    });
    emit("food-deleted");
    emit("close");
  } catch (error) {
    console.error("Error deleting food:", error);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
/* Dialog styles handled by Tailwind */
</style>
