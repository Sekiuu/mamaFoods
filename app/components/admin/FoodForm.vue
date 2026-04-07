<template>
  <div class="food-form-container">
    <h2 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit Food Item" : "Add New Food Item" }}
    </h2>
    
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Food Name<span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Enter food name"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Price<span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.price"
          type="text"
          placeholder="Enter price"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          v-model="formData.description"
          placeholder="Enter food description"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Icon URL
        </label>
        <input
          v-model="formData.icon"
          type="text"
          placeholder="Enter icon URL"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="flex gap-4 pt-4">
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          {{ isLoading ? "Loading..." : isEditing ? "Update" : "Create" }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { FoodItem } from '../../types'

interface FormData {
  name: string;
  price: string;
  description: string;
  icon: string;
}

const props = defineProps<{
  editingFood?: FoodItem | null;
}>();

const emit = defineEmits<{
  "food-created": [];
  "food-updated": [];
}>();

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isEditing = ref(false);

const formData = ref<FormData>({
  name: "",
  price: "",
  description: "",
  icon: "",
});

const resetForm = () => {
  formData.value = {
    name: "",
    price: "",
    description: "",
    icon: "",
  };
  isEditing.value = false;
  errorMessage.value = "";
  successMessage.value = "";
};

const loadEditingFood = () => {
  if (props.editingFood) {
    formData.value = {
      name: props.editingFood.name || "",
      price: props.editingFood.price || "",
      description: props.editingFood.description || "",
      icon: props.editingFood.icon || "",
    };
    isEditing.value = true;
  }
};

const submitForm = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (isEditing.value && props.editingFood?.id) {
      // Update existing food
      await $fetch(`/api/foods/${props.editingFood.id}`, {
        method: "PUT",
        body: formData.value,
      });
      successMessage.value = "Food item updated successfully!";
      emit("food-updated");
    } else {
      // Create new food
      await $fetch("/api/foods", {
        method: "POST",
        body: formData.value,
      });
      successMessage.value = "Food item created successfully!";
      emit("food-created");
    }
    resetForm();
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || "An error occurred";
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.editingFood,
  () => {
    if (props.editingFood) {
      loadEditingFood();
    }
  }
);
</script>

<style scoped>
.food-form-container {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
</style>
