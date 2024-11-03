import { ref } from 'vue'
import { createCachedFn, Key } from '@/share/ui-helper'

export const useTableStore = createCachedFn((id: Key) => {
  const selectedRowIds = ref<string[]>([])
  const mode = ref<'normal' | 'select'>('normal')
  return {
    selectedRowIds,
    mode,
  }
})
