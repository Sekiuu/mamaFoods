import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export const usePagination = <T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: {
    initialRowsPerPage?: number
    initialPage?: number
  } = {}
) => {
  const rowsPerPage = ref(options.initialRowsPerPage ?? 10)
  const page = ref(options.initialPage ?? 1)

  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / rowsPerPage.value)))

  const paginated = computed(() => {
    const start = (page.value - 1) * rowsPerPage.value
    return items.value.slice(start, start + rowsPerPage.value)
  })

  watch([rowsPerPage, () => items.value.length], () => {
    page.value = 1
  })

  watch(totalPages, () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  })

  return {
    page,
    rowsPerPage,
    totalPages,
    paginated,
  }
}

