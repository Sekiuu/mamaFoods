<script setup lang="ts">
import type { ReviewData } from '#shared/types'
import * as v from 'valibot'
import { Role } from '#shared/types/users'
import type { Select } from '@prisma/client/runtime/client';
import type { SelectItem } from '@nuxt/ui';
const props = defineProps<{
    orderId: number
}>()
const emit = defineEmits(['cancel', 'submit'])

const schema = v.object({
    rating: v.pipe(v.number(), v.maxValue(5), v.minValue(1, $t('review.validation.rating'))),
    comment: v.optional(v.string()),
})
const formData = reactive({
    rating: 0,
    comment: '',
    reviewer_role: Role.CUSTOMER,
})

const { session } = useUserSession()
const toast = useToast()
const submitReview = async () => {
    const payload = {
        reviewer_role: formData.reviewer_role,
        order_id: props.orderId,
        rating: formData.rating,
        comment: formData.comment,
    } as ReviewData
    console.log(payload)
    try {
        await $fetch('/api/reviews', {
            method: 'POST',
            body: payload,
        })
        toast.add({
            title: 'Review submitted successfully!',
            color: 'success',
            icon: 'i-lucide-check-circle',
        })
    } catch (err) {
        console.error('Validation failed:', err)
        return
    } finally {
        // You can add any cleanup code here if needed
        cancelReview()
    }
    emit('submit', payload)
}

const cancelReview = () => {
    emit('cancel')
    console.log('Review cancelled')
}

</script>

<template>
    <UCard>
        <template #header>
            <h2 class="text-2xl font-bold">{{ $t('review.title') }}</h2>
        </template>
        <UForm @submit.prevent="submitReview" :schema="schema" :state="formData" :validate-on="['change', 'blur']" class="w-full space-y-6">
            <UFormField :label="$t('review.rating')" name="rating" required>
                <UButton v-for="i in 5" :key="i" :color="formData.rating >= i ? 'primary' : 'neutral'" variant="ghost" circle size="lg"
                    @click="formData.rating = i" icon="material-symbols:kid-star-sharp" />
            </UFormField>
            <UFormField :label="$t('review.comment')" name="comment">
                <UTextarea v-model="formData.comment" :placeholder="$t('review.commentPlaceholder')" :rows="4" class="w-full" />
            </UFormField>
            <!-- Only admin and operator can select role of reviewer -->
            <UFormField v-if="[Role.ADMIN, Role.OPERATOR].includes(session?.user?.role)" :label="$t('role.roles')" name="reviewer_role">
                <USelect v-model="formData.reviewer_role" class=" min-w-32" :items="[
                    { label: $t('role.customer'), value: Role.CUSTOMER },
                    { label: $t('role.operator'), value: Role.OPERATOR },   
                    { label: $t('role.admin'), value: Role.ADMIN, disabled: session?.user?.role !== Role.ADMIN },
                ] as SelectItem[]" />
            </UFormField>

            <USeparator />
            <div class="flex justify-between">
                <UButton type="submit" color="success" :label="$t('btn.confirm')" size="xl" />
                <UButton color="error" :label="$t('btn.cancel')" size="xl" @click="cancelReview" />
            </div>
        </UForm>
    </UCard>
</template>