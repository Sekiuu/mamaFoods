<script setup lang="ts">
import type { FoodOrderItem, FoodItem, FoodOption, FoodOptionChoice } from '#shared/types/foods';
import type { RadioGroupItem, RadioGroupValue } from '@nuxt/ui';

const { t } = useI18n()

const props = defineProps<{
    item: FoodItem
    addToCart?: (item: FoodOrderItem) => void
}>()

const isModalOpen = ref(false)
const selectedChoices = ref<Record<string, any>>({})

const foodOptions = computed<FoodOption[]>(() => {
    if (!props.item.options) return []
    let options: FoodOption[] = []
    if (typeof props.item.options === 'string') {
        try {
            options = JSON.parse(props.item.options)
        } catch {
            options = []
        }
    } else {
        options = props.item.options as FoodOption[]
    }

    return options.map(opt => ({
        ...opt,
        choices: typeof opt.choices === 'string' ? JSON.parse(opt.choices) : opt.choices || []
    }))
})

const foodBasePrice = computed(() => Number(props.item.price) || 0)

const currentTotalPrice = computed(() => {
    let optionsPrice = 0
    foodOptions.value.forEach(opt => {
        const val = selectedChoices.value[opt.name]
        if (opt.type === 'single') {
            // Resolve the price from the choice name
            const choice = (opt.choices as FoodOptionChoice[]).find(c => c.name === val)
            optionsPrice += Number(choice?.price) || 0
        } else if (Array.isArray(val)) {
            val.forEach(c => optionsPrice += Number(c.price) || 0)
        }
    })
    return foodBasePrice.value + optionsPrice
})

const openModal = () => {
    const initialChoices: Record<string, any> = {}
    foodOptions.value.forEach(opt => {
        const choices = opt.choices as FoodOptionChoice[]
        if (opt.type === 'single') {
            // Store the name string, not the full object
            const defaultChoice = choices.find(c => c.default) || choices[0]
            initialChoices[opt.name] = defaultChoice?.name ?? null
        } else {
            initialChoices[opt.name] = choices.filter(c => c.default)
        }
    })
    selectedChoices.value = initialChoices
    isModalOpen.value = true
}

const handleConfirm = () => {
    if (!props.addToCart) return
    const flattenedOptions: FoodOptionChoice[] = []
    foodOptions.value.forEach(opt => {
        const val = selectedChoices.value[opt.name]
        if (opt.type === 'single') {
            // Resolve name string back to full choice object
            const choice = (opt.choices as FoodOptionChoice[]).find(c => c.name === val)
            if (choice) flattenedOptions.push(choice)
        } else if (Array.isArray(val)) {
            flattenedOptions.push(...val)
        }
    })

    props.addToCart({
        food_id: props.item.id,
        food_name: props.item.name,
        food_discription: props.item.description,
        food_price: foodBasePrice.value,
        food_icon: props.item.icon || '',
        quantity: 1,
        total_price: currentTotalPrice.value,
        options: flattenedOptions.length > 0 ? flattenedOptions : null
    })
    isModalOpen.value = false
}
</script>

<template>
    <UCard :ui="{ body: 'p-0', root: 'overflow-hidden' }" :variant="props.item.show ? 'soft' : 'subtle'"
        :class="{ 'opacity-50 pointer-events-none': !props.item.show }">
        <template #header>
            <UAlert v-if="!props.item.show" color="error" variant="soft" icon="i-lucide-circle-x" title="HIDDEN" />
        </template>
        <!-- Food Image -->
        <div class="h-48 relative overflow-hidden rounded-2xl">
            <img :src="props.item.icon ?? ''" :alt="props.item.name ?? ''" class="object-cover w-full h-full" />
            <!-- Price Tag -->
            <div
                class="absolute top-4 right-4 backdrop-blur px-3 py-1 rounded-full font-bold text-orange-600 shadow-sm">
                ฿{{ props.item.price }}
            </div>
        </div>

        <!-- Food Details -->
        <div class="p-6 whitespace-break-spaces break-all">
            <h3 class="text-xl font-bold mb-1">{{ props.item.name }}</h3>
            <p class="text-sm text-muted mb-6">{{ props.item.description }}</p>

            <div v-if="props.addToCart" class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted">
                    {{ t('food.addToCart') }}
                </span>
                <UButton color="warning" icon="i-lucide-plus" size="lg"
                    class="rounded-xl shadow-lg shadow-orange-200 active:scale-90 transition-all" @click="openModal" />
            </div>
        </div>
    </UCard>

    <UModal v-model:open="isModalOpen" :title="props.item.name || ''">
        <template #body>
            <div class="space-y-4">
                <div class="h-48 relative overflow-hidden rounded-2xl">
                    <img :src="props.item.icon ?? ''" :alt="props.item.name ?? ''" class="object-cover w-full h-full" />
                </div>

                <div v-if="foodOptions.length > 0" class="space-y-3">
                    <div v-for="option in foodOptions" :key="option.name" class="space-y-2">
                        <p class="font-semibold text-sm">{{ option.name }}</p>
                        <div v-if="option.type === 'single'" class="space-y-1">
                            <URadioGroup v-model="selectedChoices[option.name]" :items="(option.choices as FoodOptionChoice[]).map(c => (
                                {
                                    label: `${c.name} (+฿${c.price})`,
                                    value: c.name,
                                    extra: c.price ? `฿${c.price}` : undefined  
                                } as RadioGroupItem))" 
                                :default-value="selectedChoices[option.name].name"/>
                        </div>
                        <div v-else class="grid grid-cols-1 gap-2">
                            <UCheckbox v-for="choice in (option.choices as FoodOptionChoice[])" :key="choice.name"
                                :label="`${choice.name} (+฿${choice.price})`"
                                :model-value="selectedChoices[option.name].some((c: FoodOptionChoice) => c.name === choice.name)"
                                @update:model-value="(checked: boolean) => {
                                    if (checked) {
                                        selectedChoices[option.name].push(choice)
                                    } else {
                                        selectedChoices[option.name] = selectedChoices[option.name].filter((c: FoodOptionChoice) => c.name !== choice.name)
                                    }
                                }" />
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex items-center justify-between w-full">
                <div class="text-xl font-bold text-orange-600">
                    ฿{{ currentTotalPrice }}
                </div>
                <div class="flex gap-2">
                    <UButton color="neutral" variant="ghost" @click="isModalOpen = false">{{ t('btn.cancel') }}
                    </UButton>
                    <UButton color="warning" @click="handleConfirm">{{ t('btn.confirm') }}</UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
