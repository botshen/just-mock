import { createCachedFn } from '@/share/ui-helper'
import { ref } from 'vue'

export const useTabStore = createCachedFn((_id: string) => {
  const tabName = ref<string>()
  const renderKind = ref<'display' | 'mount'>('display')
  return { tabName, renderKind }
})

export type TabStore = ReturnType<typeof useTabStore>
