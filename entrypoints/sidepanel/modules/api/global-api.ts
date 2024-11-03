import { createCachedFn, type Key } from '@/share/ui-helper'
import { ref } from 'vue'

export const globalApi = {
  page: () => {
    return []
  },
}

export const useGlobal = createCachedFn((cacheKey: Key) => {
  const list = ref([])
  const page = ref(1)
  const size = ref(10)
  const total = ref(0)
  const searchParams = ref({
    data_key: '',
    data_value: '',
    status: '',
  })

  const gettingPage = ref(false)
  const getPage = async (_page?: number, modelIds?: string[]) => {
    const p = _page ?? page.value + 1
    gettingPage.value = true
    page.value = p
  }
  return {
    getPage,
    gettingPage,
    list,
    page,
    size,
    total,
    searchParams,
  }
})
