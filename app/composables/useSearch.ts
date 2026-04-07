import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

type UseSearchOptions<T> = {
  initialQuery?: string
  match?: (item: T, queryLower: string) => boolean
}

export const useSearch = <T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: UseSearchOptions<T> = {}
) => {
  const searchName = ref(options.initialQuery ?? '')

  const filterd = computed(() => {
    const q = searchName.value.trim().toLowerCase()
    const list = items.value
    if (!q) return list

    const match =
      options.match ??
      ((item: any, queryLower: string) => String(item?.name ?? '').toLowerCase().includes(queryLower))

    return list.filter((item) => match(item, q))
  })

  const resetSearch = () => {
    searchName.value = ''
  }

  const search = (s: string) => {
    searchName.value = s
  }

  return { searchName, filterd, resetSearch, search }
}