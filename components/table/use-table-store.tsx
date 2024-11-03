import type { Key } from '@/share/ui-helper'
import { createCachedFn } from '@/share/ui-helper'
import { ref } from 'vue'

export const useTableStore = createCachedFn((id: Key) => {
  const selectedRowIds = ref<string[]>([])
  const mode = ref<'normal' | 'select'>('normal')
  return {
    selectedRowIds,
    mode,
  }
})
