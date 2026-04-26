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
        <!-- Hidden badge -->
        <template v-if="!props.item.show" #header>
            <UAlert color="error" variant="soft" icon="i-lucide-circle-x" title="HIDDEN" />
        </template>

        <div class="flex flex-row md:flex-col">

            <!-- ── Image: left on mobile, top on desktop ── -->
            <div
                class="relative shrink-0 w-28 h-28 md:w-full md:h-48 overflow-hidden rounded-2xl m-3 md:m-4 md:aspect-auto">
                <img :src="props.item.icon ?? ''" :alt="props.item.name ?? ''" class="object-cover w-full h-full" />
                <!-- Price badge -->
                <UBadge color="warning" variant="solid" size="sm" class="absolute bottom-2 left-2 md:top-3 md:right-3 md:left-auto md:bottom-auto
                        backdrop-blur font-bold shadow-sm rounded-full">
                    ฿{{ props.item.price }}
                </UBadge>
            </div>

            <!-- ── Content: right on mobile, below image on desktop ── -->
            <div class="flex flex-col justify-between flex-1 py-3 pr-3 md:px-4 md:pb-4 md:pt-0 min-w-0">
                <div class="min-w-0">
                    <h3 class="font-bold text-base md:text-xl leading-tight truncate md:whitespace-normal">
                        {{ props.item.name }}
                    </h3>
                    <p class="text-xs md:text-sm text-muted mt-1 line-clamp-2 md:line-clamp-3">
                        {{ props.item.description }}
                    </p>
                </div>

                <!-- Add to cart row -->
                <div v-if="props.addToCart" class="flex items-center justify-between mt-3">
                    <!-- Price shown on desktop inline (hidden on mobile since it's on the image) -->
                    <span
                        class="block md:hidden text-sm font-semibold text-warning-600 dark:text-warning-400 font-mono">
                        ฿{{ props.item.price }}
                    </span>
                    <UButton color="warning" icon="i-lucide-plus" size="sm" :label="t('food.addToCart')"
                        :ui="{ base: 'rounded-xl md:w-full', label: 'hidden md:inline' }"
                        class="ml-auto md:ml-0 shadow-lg shadow-orange-200/50 active:scale-90 transition-all"
                        @click="openModal" />
                </div>
            </div>

        </div>
    </UCard>

    <!-- ── Modal ── -->
    <UModal v-model:open="isModalOpen" :title="props.item.name || ''">
        <template #body>
            <div class="space-y-5">
                <!-- Food image -->
                <div class="h-48 relative overflow-hidden rounded-2xl">
                    <img :src="props.item.icon ?? ''" :alt="props.item.name ?? ''" class="object-cover w-full h-full" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div class="absolute bottom-3 left-4">
                        <p class="text-white font-bold text-lg">{{ props.item.name }}</p>
                        <p class="text-white/70 text-xs">{{ props.item.description }}</p>
                    </div>
                </div>

                <!-- Options -->
                <div v-if="foodOptions.length > 0" class="space-y-4">
                    <div v-for="option in foodOptions" :key="option.name" class="space-y-2">
                        <div class="flex items-center gap-2">
                            <p class="font-semibold text-sm">{{ option.name }}</p>
                            <UBadge v-if="option.required" label="Required" color="error" variant="subtle" size="xs" />
                            <UBadge v-if="option.type === 'multiple'" label="Multiple" color="info" variant="subtle"
                                size="xs" />
                        </div>

                        <!-- Single choice -->
                        <URadioGroup v-if="option.type === 'single'" v-model="selectedChoices[option.name]" :items="(option.choices as FoodOptionChoice[]).map(c => ({
                            label: c.name,
                            value: c.name,
                            description: c.price ? `+฿${c.price}` : 'Free',
                        }))" />

                        <!-- Multiple choice -->
                        <div v-else class="space-y-2">
                            <UCheckbox v-for="choice in (option.choices as FoodOptionChoice[])" :key="choice.name"
                                :label="choice.name" :description="choice.price ? `+฿${choice.price}` : 'Free'"
                                :model-value="selectedChoices[option.name]?.some((c: FoodOptionChoice) => c.name === choice.name)"
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
                    <UButton color="warning" @click="handleConfirm">{{ t('btn.addToCart') }}</UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
